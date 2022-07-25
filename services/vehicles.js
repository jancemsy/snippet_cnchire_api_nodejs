'use strict';

const Hapi = require('hapi');
const Schmervice = require('schmervice');
const composeResponse = require('./utils/compose-response');
const queryBuilder = require('../services/utils/query-builder'); 
const Uploader = require('../helpers/uploader.js');
const moment = require('moment');

const fp = require('lodash/fp');
const knex = require('knex');
const Boom = require('boom');
const fs = require('fs');  
const { filter } = require('lodash');
const Alerts = require('./utils/notifications');  
const { createCipher } = require('crypto'); 

//bookings will match to non-completed bookings and passed step 2 
const  active_booked_filter  = " b.status NOT IN ('completed','refunded','bond-withheld','cancelled','request-rejected', 'request-approval') AND  b.step > 1 "; //,'refund-bond'
module.exports = class VehicleService extends Schmervice.Service {


  async get_exclude_dates(id){  
    const { Vehicles  } = this.server.models();  

    let exclude_dates = []; 
 
    let _query = " SELECT b.* FROM `bookings` b WHERE b.vehicle_id = " + id + " AND  " + active_booked_filter 
 
    const result = await this.server.knex().raw( _query );  
    const bookings = Object.values(JSON.parse(JSON.stringify(result[0])));        
       
    for(let row of bookings){   
      var now = new Date(row.end_date); 
      for (var d = new Date(row.start_date); d <= now; d.setDate(d.getDate() + 1)) {
        let _d = moment(d).format('YYYY-MM-DD');
        exclude_dates.push({ date : _d.toString() });
      }  
    } 

    console.log("exclude_dates ====> ", exclude_dates);

  try{
        let vehicle  = await Vehicles.query().findOne( { id } );        
                if(vehicle && vehicle.unavailability !== ''){
                  const list = JSON.parse(vehicle.unavailability) || []; 
                  for(var i = 0; i < list.length ; i ++){ 

                        let from = list[i].from; 
                        let to = list[i].to; 

                        var now = new Date(to); 
                        for (var d = new Date(from); d <= now; d.setDate(d.getDate() + 1)) {
                          let _d = moment(d).format('YYYY-MM-DD');
                          exclude_dates.push({ date : _d.toString() });
                        }   
                  }
          } 
   }catch(e){ 
  }

    return composeResponse.create(exclude_dates);
  }
  
  async getAllPending() {
    const { Vehicles  } = this.server.models();    
    const result = await Vehicles.query()   
        .join('users as owner', 'owner.id', 'vehicles.user_id')
        .select('vehicles.*',  'owner.id as ownerId', 'owner.first_name as ownerLastName', 'owner.last_name as ownerFirstName', 'owner.email as ownerEmail' ) 
        .where( { is_approved : false });  
    return composeResponse.create(result);
  }


  // drafted = status = draft
 //do not include the deleted or draft 
 //auth access 
 //used in dashboard
 async getAllDrafted( filters = {}) {
  const { Vehicles, Booking } = this.server.models();  
  const sortBy     = 'vehicles.id'; 
  const sortOrder  = 'DESC';
  const pageIndex  = filters.page ? filters.page : 1 ;
  const pageSize   = fp.getOr(10, 'page_size', filters); 
  let count        = fp.getOr(0, 'count', filters);  
  let rows        = fp.getOr(0, 'rows', filters);  

  

  var completed = Booking.query()
                 .select('vehicles.id')
                 .count('* as cnt')
                 .join('vehicles', 'bookings.vehicle_id', 'vehicles.id')
                 .where('bookings.step', 4)
                 .groupBy('bookings.vehicle_id');


  var booked = Booking.query()
                 .select('vehicles.id')
                 .count('* as cnt')
                 .join('vehicles', 'bookings.vehicle_id', 'vehicles.id')
                 .groupBy('bookings.vehicle_id');  

                 
 var activeBooked = this.server.knex().raw("(select vehicles.id, count(*) as cnt from bookings  inner join vehicles on bookings.vehicle_id = vehicles.id WHERE bookings.status NOT LIKE 'completed' group by bookings.vehicle_id ) as activeBooked"); 


  

  if(count === 0){
    const temp_result = await Vehicles.query().select('vehicles.*' ).where({   is_deleted : false,  is_active : false  })  
    count = Math.ceil(temp_result.length / pageSize);
    rows = temp_result.length;
   }  


  const result = await Vehicles.query()  
      .leftJoin( completed.as('completedtbl'), 'completedtbl.id', 'vehicles.id') 
      .leftJoin( booked.as('bookedtbl'), 'bookedtbl.id', 'vehicles.id') 
      .leftJoin( activeBooked, 'activeBooked.id', 'vehicles.id') 
      .join('users as owner', 'owner.id', 'vehicles.user_id')
      .select('vehicles.*', 'activeBooked.cnt as activeBooked', 'bookedtbl.cnt AS booked', 'completedtbl.cnt AS completed',
      'owner.id as ownerId',
      'owner.first_name as ownerLastName',
      'owner.last_name as ownerFirstName',
      'owner.email as ownerEmail',
      )  
      
      .where({  'vehicles.status' : 'draft' }) 
      .page(pageIndex - 1, pageSize)
      .orderBy(sortBy, sortOrder); 


  return composeResponse.create(result, {
    page: pageIndex,
    pageSize,
    sortBy: fp.camelCase(sortBy),
    sortOrder,
    count,
    rows
  });
}


 //is_active = 0 is drafted, 
 //do not include the deleted or draft 
 //auth access  
 //used in dashboard
  async getAll( filters = {}) { 
    const { Vehicles, Booking } = this.server.models();  
    let sortBy     = 'vehicles.id'; 
    let sortOrder  = 'DESC';
    let search = '';
    let pageIndex  = filters.page ? filters.page : 1 ;
    let pageSize   = fp.getOr(12, 'page_size', filters); 
    let count        = fp.getOr(0, 'count', filters);  
    let rows         = fp.getOr(0, 'rows', filters);   
 
 

    if(filters.filteredOwner > 0 ){
      search =  " vehicles.user_id ='" + filters.filteredOwner + "' " ;  
    }

    search = search !== '' ? search  + " AND " :  search;  
    if(filters && filters.filteredVehicle){ 
      search = search +  " vehicles.id = '" + filters.filteredVehicle + "'  AND vehicles.is_deleted =  0 AND vehicles.is_active  = 1 "; 
    }else{    
      search = search +  "  vehicles.is_deleted =  0 AND vehicles.is_active  = 1 ";   
    }
 

    if( filters.search && filters.search !== ''){
        search = search !== '' ? search  + " AND " :  search;  
        search =  search + "  vehicles.vehicle_name  LIKE  '%"+ filters.search + "%' ";    
    }
                
    switch(filters.filter){ 
      case 2: 
        sortBy = 'vehicles.vehicle_name';   
      break; 
      case 3:
        sortBy = 'vehicles.created_at';  
      break; 
      case 4:
        sortBy = 'vehicles.price_per_day';  
      break; 
      case 5:
        search = search !== '' ? search  + " AND " :  search;  
        search =  search + "  vehicles.status  =  'pending' ";   
      break; 
      case 6:
        search = search !== '' ? search  + " AND " :  search;  
        search =  search +  "  vehicles.status  =  'draft' ";   
      break;  
    }
 


    var completed = Booking.query()
                   .select('vehicles.id')
                   .count('* as cnt')
                   .join('vehicles', 'bookings.vehicle_id', 'vehicles.id')
                   .where('bookings.step', 4)
                   .groupBy('bookings.vehicle_id');


    var booked = Booking.query()
                   .select('vehicles.id')
                   .count('* as cnt')
                   .join('vehicles', 'bookings.vehicle_id', 'vehicles.id')
                   .groupBy('bookings.vehicle_id');  

                   
   var activeBooked = this.server.knex().raw("(select vehicles.id, count(*) as cnt from bookings  inner join vehicles on bookings.vehicle_id = vehicles.id WHERE bookings.status NOT LIKE 'completed' group by bookings.vehicle_id ) as activeBooked"); 


    


   search = this.server.knex().raw(search);  

    if(count === 0){
      const temp_result = await Vehicles.query().select('vehicles.*' ).where(search)  
      count = Math.ceil(temp_result.length / pageSize);
      rows = temp_result.length;
     }          


    const result = await Vehicles.query()  
        
        //.leftJoin( completed.as('completedtbl'), 'completedtbl.id', 'vehicles.id') 
        //.leftJoin( booked.as('bookedtbl'), 'bookedtbl.id', 'vehicles.id') 
        //.leftJoin( activeBooked, 'activeBooked.id', 'vehicles.id') 

        .join('users as owner', 'owner.id', 'vehicles.user_id')
        .select('vehicles.*' ,  // 'activeBooked.cnt as activeBooked', 'bookedtbl.cnt AS booked', 'completedtbl.cnt AS completed',
        'owner.id as ownerId',
        'owner.first_name as ownerLastName',
        'owner.last_name as ownerFirstName',
        'owner.email as ownerEmail',
        )  
        
        .where(search) 
        .page(pageIndex - 1  , pageSize)
        .orderBy(sortBy, sortOrder); 
  

    return composeResponse.create(result, {
      rows,
      page: pageIndex,
      pageSize,
      sortBy: fp.camelCase(sortBy),
      sortOrder,
      count
    });
  }
 
  


  //by location or by other fields
  //display all but by nearest location and return kilometers computed by GeoLat 
  //used in front-page 
  async searchVehicles(filters = {}) {    
    
    const { Vehicles } = this.server.models(); 
    let sortBy = fp.getOr('created_at', 'sort_by', filters);
    let sortOrder = fp.getOr('desc', 'sort_order', filters);
    const pageIndex = fp.getOr(0, 'page', filters);
    const pageSize = fp.getOr(12, 'page_size', filters); 
    const pagingSortingKeys = ['page', 'page_size', 'sort_order', 'sort_by'];
    const filterParams = fp.omit(pagingSortingKeys)(filters);  
  
 
/* 
  lng: '115.9902668',
  lat: '-32.0823022',
  vehicleType: 'Expander',
  numberOfTravellers: '3',
  hireType: 'Hirer Tow',
  minPrice: 25,
  maxPrice: 50,
  minYear: 1990,
  maxYear: 2004,
  keyword: 'dddd' 

  */ 

  let select = ' vehicles.* '; 
  let condition = " is_deleted = false AND is_active = true AND vehicles.status LIKE 'active'  ";

  if(filterParams.minYear){
     condition = condition + '  AND ' +  ' vehicle_year_manufactured >=  ' + filterParams.minYear;  
  } 

  if(filterParams.maxYear){
    condition = condition + '  AND ' +  ' vehicle_year_manufactured <=  ' + filterParams.maxYear;  
  } 


  if(filterParams.minPrice){
    condition = condition + '  AND ' +  ' price_per_day >=  ' + filterParams.minPrice;  
  } 

  if(filterParams.maxPrice){
    condition = condition + '  AND ' +  ' price_per_day <=  ' + filterParams.maxPrice;  
  } 

  if(filterParams.keyword){
    condition = condition + '  AND ' +  ' vehicle_name LIKE  \'%' + filterParams.keyword + '%\'';  
  } 

 
  if(filters.lat){ 
          const lat = filters.lat;
          const lng = filters.lng;  

          sortBy = 'distance';
          sortOrder = 'ASC';
          select = select +   
          `,(6371 * acos(  ` + 
          ` cos( radians(${lat}) ) ` + 
          ` * cos( radians( lat ) ) ` +
          ` * cos( radians( lng ) - radians(${lng}) ) ` +
          ` + sin( radians(${lat}) ) ` + 
          ` * sin( radians( lat ) ) ` + 
          `  ) ) as distance `;
 
            condition = condition + ' ';  //+ ' HAVING distance <= 10 ';
    }

    
    if(filters.vehicleType && filters.vehicleType  !== 'All Vehicle Types'){
      condition = condition + ` AND vehicle_type LIKE  '${filters.vehicleType}' `; // {  vehicle_type : filters.vehicleType,  ...condition};
     }

     select  = "  " +  select;


     //IF(b.id > 0, 1, 0) as is_booked ,
  let vehicles;  

  vehicles = await Vehicles.query() 
//  .leftJoin(this.server.knex().raw( "  bookings b ON " + active_booked_filter + "  AND b.vehicle_id = vehicles.id  AND b.start_date <= NOW() AND b.end_date >= NOW() ")  )
  .select(this.server.knex().raw(select) )  
  .where( this.server.knex().raw( condition) )  
  .page(pageIndex, pageSize)
  .orderBy(sortBy, sortOrder)
  .groupBy( this.server.knex().raw( 'vehicles.id' ) );   
   
    return composeResponse.create(vehicles, { 
      page: pageIndex,
      pageSize,
      sortBy: fp.camelCase(sortBy),
      sortOrder,
      count: fp.get('results.length', vehicles)
    });
  }
 
  //  public access search by state or search by vehicleType 
  // /all vehicles 
  //used in front page
  async getVehicles(filters = {}) {  
    const sortBy = fp.getOr('id', 'sort_by', filters);
    const sortOrder = fp.getOr('desc', 'sort_order', filters); 
    const pageIndex  = filters.page ? filters.page : 1 ;
    const pageSize = fp.getOr(9, 'page_size', filters); 
    let count        = fp.getOr(0, 'count', filters);     
    let rows        = fp.getOr(0, 'rows', filters);           


    //console.log("pageIndex========================================>",filters);

    let _condition =  " WHERE v.is_deleted = 0 AND v.is_approved = 1 AND v.is_active = 1 AND v.status LIKE 'active' ";
    //let _join = " LEFT JOIN bookings b ON  " + active_booked_filter + " AND b.vehicle_id = v.id  AND b.start_date <= NOW() AND b.end_date >= NOW()  "; 
    

    if(filters.state ){
      _condition = _condition  + " AND v.state LIKE  '" + filters.state+ "'" 
    }


    //IF(b.id > 0, 1, 0) as is_booked,
    let _query =  ' SELECT  v.*  ' + 
    'FROM `vehicles` as v '+ 
      //_join +  
     _condition +   
    ' GROUP BY v.id  ORDER BY  '+ sortBy + ' ' + sortOrder ; 

    if(count === 0){  
      const result_temp = await this.server.knex().raw( _query ); 
      const _temp = Object.values(JSON.parse(JSON.stringify(result_temp[0])));       
      rows = _temp.length ; 
      count = Math.ceil(_temp.length / pageSize); 
    } 

    
     const offset = (pageIndex - 1) * pageSize;

    _query = _query + ' LIMIT '+ offset + ', ' + pageSize + ' ';


    const result = await this.server.knex().raw( _query ); 
    const vehicles = Object.values(JSON.parse(JSON.stringify(result[0])));         

    return composeResponse.create(vehicles, {
      page: pageIndex,
      pageSize,
      sortBy: fp.camelCase(sortBy),
      sortOrder,
      count, 
      rows
    });
  }

  async softDelete(id) {
    try {
      const { Vehicles } = this.server.models();
      const query = await Vehicles.query()
        .where({ 'is_deleted': false })
        .patchAndFetchById(id, { is_deleted: true });

      if (fp.isNil(query)) {
        return Boom.notFound();
      }

      return composeResponse.create(query);
    }
    catch (error) {
      throw error;
    }
  }
 
async approve(id) {
  try {
    const { Vehicles } = this.server.models();

    const vehicle = await Vehicles.query().findOne({ id }); 
    vehicle.is_approved = 1;
    vehicle.status = 'active'; 
    await Vehicles.query().where({ id } ).update(vehicle); 
 

    return composeResponse.create(vehicle);
  }
  catch (error) {
    throw error;
  }
}
  
  async disable(id) {
    try {
      const { Vehicles } = this.server.models();
      const query = await Vehicles.query()
        //.where({ 'is_active': false })
        .patchAndFetchById(id, { is_active: false });

      if (fp.isNil(query)) {
        return Boom.notFound();
      }

      return composeResponse.create(query);
    }
    catch (error) {
      throw error;
    }
  }


  
  async enable(id) {
    try {
      const { Vehicles } = this.server.models();
      const query = await Vehicles.query()
        //.where({ 'is_active': false })
        .patchAndFetchById(id, { is_active: true });

      if (fp.isNil(query)) {
        return Boom.notFound();
      }

      return composeResponse.create(query);
    }
    catch (error) {
      throw error;
    }
  }




  async getVehicleDetails(filters = {}) {
    const { Vehicles } = this.server.models();

    const sortBy = fp.getOr('created_at', 'sort_by', filters);
    const sortOrder = fp.getOr('desc', 'sort_order', filters);
    const pageIndex = fp.getOr(0, 'page', filters);
    const pageSize = fp.getOr(100, 'page_size', filters);

    const pagingSortingKeys = ['page', 'page_size', 'sort_order', 'sort_by'];
    const filterParams = fp.omit(pagingSortingKeys)(filters);
    const query = queryBuilder(Vehicles.query(), filterParams);

    // sorting + pagination
    const vehicleDetails = await query
      .page(pageIndex, pageSize)
      .orderBy(sortBy, sortOrder);


    return composeResponse.create(vehicleDetails, {
      page: pageIndex,
      pageSize,
      sortBy: fp.camelCase(sortBy),
      sortOrder,
      count: fp.get('results.length', vehicleDetails)
    });
  }


  
  async findByIdFull(id){
    return this.findById(id); 
  }


  //include all reviews per vehicle as it is too small now to separate it with vehicle content
  //this will be called in vehicle detail page 
  async findById(id) {
    const { Vehicles, Amenities,Reviews } = this.server.models();
    const vehicle = await Vehicles.query().findOne({id});
    let amenities = [];
    let reviews = [];


    if(vehicle){ 
      const amenitiesList = await Amenities.query(); 
      const vehicle_ids = vehicle.amenities.split(',');    

 

      let _query = "SELECT r.*, CONCAT(u.first_name,\" \", u.last_name) as name  FROM reviews r " +  
        " INNER JOIN users u ON u.id = r.user_id " +
        " WHERE r.vehicle_id = " + vehicle.id + " AND r.is_approved = 1  ORDER BY id DESC " ;
      
      
      const result_temp = await this.server.knex().raw( _query ); 
      const reviews_loop = Object.values(JSON.parse(JSON.stringify(result_temp[0])));       

      reviews_loop.forEach( item =>{
             reviews.push({ ...item});
      }); 
 
 
      for(let item of amenitiesList){ 
        let matched = vehicle_ids.findIndex(id =>  parseInt(id) === parseInt(item.id) );
        let selected = matched > -1 ? true : false;  
        amenities.push({ selected , ... item}); 
      } 

    }else{
      return Boom.notFound();
    }
 

    return composeResponse.create({ vehicle , amenities, reviews });
  }


   
  async canUserUpdate(user_id, id){
    const { Vehicles } = this.server.models();
    const vehicle = await Vehicles.query().findOne({id, user_id }); 
    return vehicle ?  true : false; 
  }


  async updateImages(payload){
    console.log("updateImages debugging 1- -------------------------------1", payload);
    var _payload = { ...payload}; 

    if(_payload.images.search("tmp/") > -1){

 
      console.log("updateImages debugging 1- -------------------------------2 userid ---> ",payload.user_id);
      const _uploader = new Uploader(payload.user_id, {});   
      let images = JSON.parse(payload.images);
      let new_url = "";
      let temp_online_file = "";  
      for(var i = 0; i < images.length ; i ++){  
         temp_online_file = images[i].image;   
         console.log("updateImages debugging 1- -------------------------------2222", temp_online_file);   
         if(temp_online_file.search("tmp/") > -1){
          images[i].image = await _uploader.move_file_to_permanent(temp_online_file); 
         }
      }

      console.log("updateImages debugging 1- -------------------------------3");
      _payload["images"] = JSON.stringify(images);   
    }

    console.log("updateImages debugging 1- -------------------------------4");

    return _payload;
  }


  async createVehicle(_payload = {}, user) {
    const payload = await this.updateImages(_payload);
    const { Vehicles } = this.server.models();
    const vehicle = await Vehicles.query().insert(payload);


    Alerts.sendNewVehicleAdminNotifications(vehicle,user);  
    return composeResponse.create(vehicle);
  }


  async updateVehicleDetails(id, _payload = {}) { 
    try {
      const { Vehicles } = this.server.models();
      const vehicle = await Vehicles.query().findOne({id}); 
      const payload = await this.updateImages({ user_id: vehicle.user_id, ..._payload}); 
      

       switch(payload['status']){
         case 'active':  
           payload['is_active'] = true; 
           payload['is_approved'] = true;  
         break;

         case 'offline':  
           payload['is_active']   = false; 
           payload['is_approved'] = true;   
         break;

         case 'draft':  
           payload['is_active'] = false; 
           payload['is_approved'] = true;  
         break;

         case 'pending':  
           payload['is_active'] = true;   
           payload['is_approved'] = false;  
         break; 

         default: //as is 
          payload['is_approved'] = vehicle.is_approved;  
       }
  
 

      const query = await Vehicles
        .query()
        .patchAndFetchById(id, payload);

      if (fp.isNil(query)) {
        return Boom.notFound();
      }

      return composeResponse.create(query);
    }
    catch (error) {
      throw error;
    }
  }
 
};
