/* eslint-disable max-lines */
'use strict';

const Schmervice = require('schmervice');
const fp = require('lodash/fp');
const Boom = require('boom');
const queryBuilder = require('./utils/query-builder'); 
const Response = require('./utils/compose-response');  
const Alerts = require('./utils/notifications'); 
const Helper = require('./utils/helpers');  
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');  

module.exports = class BookingService extends Schmervice.Service {     

  async getNotificationVariables(request, booking_id){
    const { userService  } = request.services(); 
    const { Booking, Vehicles, BondClaims } = this.server.models();   
    const booking  = await Booking.query().findOne( { 'id' : booking_id  } ); 
    const vehicle  = await Vehicles.query().findOne( { 'id' : booking.vehicle_id  } ); 
    const bondclaims = await BondClaims.query().findOne( { 'booking_id' : booking.id  } ); 

    const hirer = await userService.getUser(booking.hirer_id);  
    const owner = await userService.getUser(booking.owner_id);   
    const booking_link = '<a href="' + this.getAppUrl() + 'dashboard/bookings/?id=' + booking.id + '">' + this.getAppUrl() + 'dashboard/bookings/?id=' + booking.id + '</a>'; 
    const owner_name_link = '<a href="' + this.getAppUrl() + 'profile/' + owner.id + '">'+ owner.first_name +'</a>'; 
    const hirer_name_link = '<a href="' + this.getAppUrl() + 'profile/' + hirer.id + '">'+ hirer.first_name +'</a>';   
    const {  Notification  } = this.server.models();    
    return { bondclaims, notification: Notification, vehicle, booking_link,   app_url : this.getAppUrl(), hirer, owner, booking, owner_name_link, hirer_name_link  }; 
  }


  getAppUrl(){ //this should be defined in the environment variable 
    return  process.env.APP_URL;
  } 

  async message(user,payload){ 
    const { Booking  } = this.server.models();  //, Vehicles, User
    let id = payload.id; 
    let booking  = await Booking.query().findOne( { id } );    
    let booking_result = null;

    
    if(booking){
      let messages = booking.messaging ? JSON.parse(booking.messaging) || [] : [];
      messages.unshift({  by: user.firstName + " " + user.lastName, user_type: user.userRole, message:  payload.message, time: moment().format("YYYY-MM-DD HH:mm") }); 
      let  update_params   = { messaging : JSON.stringify(messages)  };    
      booking_result = await Booking.query().where(  'id' , '=', payload.id).update(update_params);     
    }

    return Response.create(booking_result);  
  } 

  async getPaymentDetail(id, hirer_id){ 
    const { PaymentDetail  } = this.server.models();   
    return await PaymentDetail.query().findOne( { 'id' : id , user_id :  hirer_id  } );  
  }  
 

  //check pending booking passed 24hour period 
  async cron(request){ 
    return false; //disable this feature in local. 


    const {stripeService } = request.services();      
    const { Booking, Payment } = this.server.models();    
    let condition = this.server.knex().raw( " date_approved IS NOT NULL AND  date_approved != '' AND  DATE_ADD(date_approved, INTERVAL 24 HOUR) <= CURRENT_DATE()   AND   status = 'request-approved'    ");  // but date_approved < 24 still request approved?
    let booking = await Booking.query().findOne( condition );        
    if(booking){ 
      this.updateStatus(booking.id, 'cancelled'); 
      Alerts.sendBookingRequestCancelledNotifications( await this.getNotificationVariables(request, booking.id) ) 
    }   

 
    //get pending holding and process 
    let payment = await Payment.query().findOne( this.server.knex().raw( " status = 'pending' AND payment_type = 'bond-holding' ") );        
    if(payment){
      let result = await stripeService.processHolding(payment.amount, payment.booking_id); 
      if(result){
         payment.stripe_transaction_id = result.id; 
         payment.status = 'complete';
         await Payment.query().where({ id :  payment.id }).update(payment);  
      } 
    } 
    
  }

  async sendOwnerBondClaimHirerRefund(booking_id,  request){    
    const { Booking } = this.server.models();    
    const {stripeService, userService } = request.services();      
    const booking = await Booking.query().findOne( { id : booking_id } );        
    const user_id = booking.owner_id;    
    const _payment = {booking_id,  amount: booking.bond_amount, user_id };   
    let payment_result = true; 
 
    if(booking.version === 2){ 
       payment_result = await stripeService.refundHirer(_payment , booking.bond_claim_amount);       
    } 
  
    if(payment_result){ 
      let claim_result = await this.sendBondClaimOwnerPayout(booking_id,  request);
      if( claim_result ){
        let params = await this.getNotificationVariables(request, booking.id); 
        Alerts.sendBondClaimPayoutOwnerNotifications(params);  
        Alerts.sendBondClaimPayoutHirerNotifications(params);  

        //update booking status
        this.updateStatus(booking_id, 'bond-withheld'); //complete but will mark status as withheld. 
      } 
      return Response.create("success"); 
    }else{
      return Response.error("failed");
    } 

  } 


  async sendHirerRefund(booking_id,  request){    
    const { Booking } = this.server.models();    
    const {stripeService, userService } = request.services();      
    const booking = await Booking.query().findOne( { id : booking_id } );        
    const user_id = booking.owner_id;   
    //const stripe_account_id = await userService.getStripeAccountId(user_id);   
    const _payment = {booking_id,  amount: booking.bond_amount, user_id };   
    let payment_result = true; 

    if(booking.version === 2){
        payment_result = await stripeService.refundHirer( _payment);      
    } 
    
    if(payment_result){
      booking.is_refunded = 1;
      booking.status = 'completed';
      await Booking.query().where({ id : booking_id }).update(booking);  
    }  
        
    Alerts.sendBondRefundedNotification(await this.getNotificationVariables(request, booking.id));      

    return Response.create(payment_result); 
  } 
  
  async get(booking_id){
    const { Booking } = this.server.models();   
    return  await Booking.query().findOne( { id : booking_id } );         
  }


  async sendOwnerPayout(booking_id,  request){    
    const { Booking , Payment} = this.server.models();     
    const {stripeService, userService } = request.services();      
    const booking = await Booking.query().findOne( { id : booking_id } );        
    const user_id = booking.owner_id;   
    const stripe_account_id = await userService.getStripeAccountId(user_id);   
    const _payment = { amount: booking.total_earnings};   
    let payment_result = true; 

    if(booking.version === 2){

      console.log("sending owner account-stripe id? ", stripe_account_id);

      payment_result = await stripeService.payOwner(stripe_account_id, _payment);       
      
      if( payment_result ){
            const payment =  await Payment.query().insert({
              booking_id : booking_id ,   
              date_transacted:  new Date(), 
              amount:  booking.total_earnings , 
              user_id : user_id, 
              card_id : 'n/a',
              payment_type : 'payout-transfer',
              status : 'complete', 
              stripe_transaction_id :  payment_result.id
            });    

            booking.is_payout_transfered = 1; 
            await Booking.query().where({ id : booking_id }).update(booking);  
            Alerts.sendOnHirePaymentNotification(await this.getNotificationVariables(request, booking.id));      

            return Response.create(payment); 
      }  
    }
     
    throw 'Payout transaction failed!';
  } 
  

  async sendBondClaimOwnerPayout(booking_id,  request){    
    const { Booking } = this.server.models();    
    const {stripeService, userService } = request.services();      
    const booking = await Booking.query().findOne( { id : booking_id } );        
    const user_id = booking.owner_id;   
    const stripe_account_id = await userService.getStripeAccountId(user_id);   
    const _payment = {booking_id,  amount: booking.bond_claim_amount - 25, user_id };   
    let payment_result = true; 

    if(booking.version === 2){
      payment_result = await stripeService.payOwner(stripe_account_id, _payment, 'bond-claim-payout');      
    }
    
    if(payment_result){
      booking.is_payout_transfered = 1; 
      await Booking.query().where({ id : booking_id }).update(booking);  
      return true; 
    }else{
      return false; 
    } 
  } 
   

  
  async statusManualUpdate(payload, request ) {   
    const booking_id = payload.booking_id;
    const status = payload.status;    
    const { Booking } = this.server.models();     
    let booking = await Booking.query().findOne( { id : booking_id } );         

    if(booking){       
        let is_status_updated = false; 
        if(booking.status !== status){
          is_status_updated = true; 
        }
        booking.start_date = moment(payload.start_date).format("YYYY-MM-DD");
        booking.end_date   = moment(payload.end_date).format("YYYY-MM-DD");
        booking.status = status;         
        booking.service_fee  = payload.service_fee;
        booking.insurance_fee =  payload.insurance_fee;
        booking.total_amount = payload.total_amount; 
        booking.total_earnings = payload.total_earnings;
        booking.commission    = payload.commission; 
        booking.total_commission  = payload.total_commission; 
 
        await Booking.query().where({  id : booking_id }).update(booking);   //update booking.  

        if(is_status_updated){
          let email_params = await this.getNotificationVariables(request, booking.id);  
          Alerts.sendBookingStatusUpdateNotifications(email_params, status); 
        }

    } 
    return Response.create(booking);  
  }

  async statusUpdate(payload, user, request ) {   
    const booking_id = payload.booking_id;
    const status = payload.status;  

    const { Booking } = this.server.models();    
    let booking = false; 

    if(user.userRole === 'Owner'){
      booking = await Booking.query().findOne( { id : booking_id, owner_id : user.id } );        
    }else{
      booking = await Booking.query().findOne( { id : booking_id } );        
    } 
 

    if(booking){    


         if(status === 'bond-investigate'){ //special adjustment to include bond_claim_amount 
            booking.bond_claim_amount = payload.total_claim_deduction + 25;
         }else if(status === 'request-approved'){ //special adjustment to include bond_claim_amount  
           booking.date_approved  =   moment(new Date).format("YYYY-MM-DD HH:mm:ss");
         }

        booking.status = status;         
        await Booking.query().where({  id : booking_id }).update(booking);   //update booking. 

        
        let email_params = await this.getNotificationVariables(request, booking.id);


        //do the following action here 
        switch(status){ 

          //auto  
          case 'request-approved':             
            Alerts.sendBookingRequestApprovedNotifications(email_params) ;
          break;    
          case 'request-rejected': 
            Alerts.sendBookingRequestRejectedNotifications(email_params);
          break;   

          case 'onhire' :       
              Alerts.sendBookingOnHireNotifications(email_params);    
            //send to everyone (hirer,admin and owner that the booking is onhirer) 
          break;  

          case 'refund':   //owner sends the refund. .previous cnc version is refund-bond
             Alerts.sendReadyForRefundNotification(email_params);       
          break; 
           
          case 'withold':
            Alerts.sendWithHoldFundNotification(email_params);       
            //send email to everyone
          break;  

          case 'bond-investigate': 
            const { BondClaims } = this.server.models();  
            let { date_of_return , items, hirer_id, owner_id, vehicle_id, booking_id , total_claim_deduction } = payload; 
            await BondClaims.query().insert({   date_of_return , items, vehicle_id , hirer_id, owner_id, booking_id , total_claim_deduction : (total_claim_deduction + 25)  });       

            let email_params2 = await this.getNotificationVariables(request, booking.id); //update the bond claims info 
            Alerts.sendBondClaimNotifications(email_params2);                  
          break; 

          case 'investigate': 
            //send email to admin 
          break; 
       }   


    }
  

    return Response.create(booking);  
  }

 
  async getBookingDetailUuid(uuid, request){
    const {  vehicleService } = request.services();
    const { Booking    } = this.server.models(); 
    let booking  = await Booking.query().findOne( { uuid  } );    
    let result = await vehicleService.findById(booking.vehicle_id); 
    let {vehicle, amenities } = result.data;  


    booking = { vehicle_name : vehicle.vehicle_name ,...booking}; 
    booking.start_date = moment(booking.start_date).format("ll");
    booking.end_date = moment(booking.end_date).format("ll");
 
    return Response.create({ booking,vehicle, amenities });   
  } 

  async getBookingDetail(id) { 
    const { Booking, Vehicles, User  } = this.server.models(); 
    let booking  = await Booking.query().findOne( { id } );    
    const vehicle  = await Vehicles.query().findOne( { id : booking.vehicle_id } );    
    const hirer  = await User.query().findOne( { id : booking.hirer_id } );    
    const owner  = await User.query().findOne( { id : booking.owner_id } );     
    booking.start_date = moment(booking.start_date).format("ll");
    booking.end_date = moment(booking.end_date).format("ll"); 
    return Response.create({ booking, vehicle, hirer , owner});   
  } 

  
  async getAll( user, payload ) {  
    const filterByBookingID = payload.id  || null;
    const filters =  payload.filter || {} ;  

    let sortBy     = 'bookings.id';
    let sortOrder  = 'DESC';

    //const sortBy     = 'bookings.start_date';
    //const sortOrder  = 'DESC';

    const pageIndex  = filters.page ? filters.page : 1 ;
    const pageSize   = fp.getOr(50, 'page_size', filters); 
    let count        = fp.getOr(0, 'count', filters);  
 
    const { Booking } = this.server.models(); 
    let search = '';
    const filterID = parseInt(filterByBookingID); 


    let date_range = ''; 

    if(filters.dateFiltered){ //other api doesnt have daterange filter requirement

      if(filters.to !== ''){
        date_range = "bookings.created_at  BETWEEN  '" + filters.from + "' AND  '" + filters.to + "' ";
      }else{
        date_range = "bookings.created_at BETWEEN now() - INTERVAL 12 month AND now() ";
      } 
    }
    
    if(filters.filterHirer && filters.filterHirer  > 0){ //get content by hirerID   
        search = " bookings.hirer_id = '" + filters.filterHirer + "' "; //we dont use range
    }else{  


       switch(user.userRole){
         case 'Owner': 
           search = " bookings.status != 'request-rejected' AND  bookings.owner_id = '"+user.id+"' " + ( date_range !== '' ? ' AND ' +   date_range :  date_range ) 
         break;
         case 'Hirer':
           search = " bookings.status != 'request-rejected' AND  bookings.hirer_id = '"+user.id+"' " + ( date_range !== '' ? ' AND ' +   date_range :  date_range ) 
         break;
         default: 
           search = ""  + date_range;
       }

       
    }



    //
    
    switch(filters.filter){
      

      case 2: //onhire only    
         search = search !== '' ? search  + " AND " :  search;  
         search = search + " bookings.status = 'onhire' ";     
      break; 

      case 3: //unpaid 
         search = search !== '' ? search  + " AND " :  search;  
         search = search + " bookings.status = 'unpaid' ";
      break; 


      case 4: //partial-payment 
         search = search !== '' ? search  + " AND " :  search;  
         search = search + " bookings.status = 'partial-payment' ";
      break; 


      case 5: //request-approval
         search = search !== '' ? search  + " AND " :  search;  
         search = search + " bookings.status = 'request-approval' ";
      break; 

      case 6: //pending booking
         search = search !== '' ? search  + " AND " :  search;  
         search = search + " bookings.status NOT IN ('cancelled','completed','refunded','refund-bond','bond-withheld')  ";
      break; 


      case 7: //not commencing date yet
         search = search !== '' ? search  + " AND " :  search;  
         search = search + " bookings.start_date > NOW()  ";
      break; 


      case 8: //awaiting hire payment
        search = search !== '' ? search  + " AND " :  search;  
        search = search + "bookings.status  IN ('unpaid','partial-payment')    ";
      break; 


      case 9: //cancelled
        search = search !== '' ? search  + " AND " :  search;  
        search = search + "bookings.status  IN ('cancelled')    ";
      break; 

      case 10: //bond-withheld
        search = search !== '' ? search  + " AND " :  search;  
        search = search + "bookings.status  IN ('bond-withheld')    ";
      break;  

      
      case 11: //completed booking
         search = search !== '' ? search  + " AND " :  search;  
         search = search + " bookings.status  IN ('completed','refunded','refund-bond','bond-withheld')  ";
      break; 

      
      case 12: //order by date range 

         sortBy     = 'bookings.start_date';
        sortOrder  = 'DESC';  
      break; 

            
      case 13: //order by date range 

         sortBy     = 'bookings.start_date';
        sortOrder  = 'ASC';


      break; 


      default: 
        //search = search + " AND bookings.status = 'unpaid' ";
       
    }


    
    if( filters.search && filters.search !== ''){
      search = search !== '' ? search  + " AND " :  search;  
      if( parseInt(filters.search) > 0){ 
        search =  search + "   bookings.id LIKE '%" + filters.search + "%'";    
      }else{
        search =  search + "  vehicles.vehicle_name  LIKE  '%"+ filters.search + "%' OR bookings.id = '" + filters.search + "'";    
      }
    }
           



    if( filterID  > 0 ){
           search = search !== '' ? search + " AND bookings.id = '" + filterID + "' " :  " bookings.id = '" + filterID + "' ";
    } 


 



    search = search !== '' ? search  + " AND " :  search;  
    search =   search + " bookings.status != 'was-in-cart' ";  //do not include this 
     



    ///only booking that passed to step 2 and more can be displayable 
    search = search !== '' ? search  + " AND " :  search;  
    search =   search + " bookings.step > 1  ";  //do not include this 
     

    
   console.log("[debug] ---search", search);


    search = this.server.knex().raw(search); 
 
    if(count === 0){
        const temp_result = await Booking.query()
                    
                      .select( 'vehicles.vehicle_name as vehicleName', 
                               'vehicles.price_per_day as pricePerDay',
                               'vehicles.addon_amenities as addonAmenities',
                               'vehicles.rate_rules as rateRules', 
                               'vehicles.images as vehicleImages',
                               'vehicles.thumbnail as vehicleThumbnail',

                               'owner.id as ownerId',
                               'owner.first_name as ownerFirstName',
                               'owner.last_name as ownerLastName',
                               'owner.email as ownerEmail',

                               'hirer.id as hirerId',
                               'hirer.first_name as hirerFirstName',
                               'hirer.last_name as hirerLastName',
                               'hirer.email as hirerEmail', 
 
                               'bookings.*')


                    .join('users as owner', 'owner.id', 'bookings.owner_id')
                    .join('users as hirer', 'hirer.id', 'bookings.hirer_id')
                    

                    .join('vehicles', 'vehicles.id', 'bookings.vehicle_id')
                    .where(search);

         count = Math.ceil(temp_result.length / pageSize);
    }

  


    const result = await Booking.query() 
                      .select('vehicles.vehicle_name as vehicleName',  
                              'vehicles.images as vehicleImages',
                              'vehicles.thumbnail as vehicleThumbnail',
                              'vehicles.price_per_day as pricePerDay',
                              'vehicles.rate_rules as rateRules',

                              'owner.id as ownerId',
                              'owner.first_name as ownerFirstName',
                              'owner.last_name as ownerLastName',
                              'owner.email as ownerEmail',

                              'hirer.id as hirerId',
                              'hirer.first_name as hirerFirstName',
                              'hirer.last_name as hirerLastName',
                              'hirer.email as hirerEmail',  
                              'bookings.*') 

                    .join('users as owner', 'owner.id', 'bookings.owner_id')
                    .join('users as hirer', 'hirer.id', 'bookings.hirer_id')
                    

                    .join('vehicles', 'vehicles.id', 'bookings.vehicle_id')
                    .where(search) 
    .page(pageIndex - 1, pageSize)
    .orderBy(sortBy, sortOrder); 

    if (fp.isNil(result)) {
      return Boom.notFound();
    } 
    return Response.create(result, {
      page: pageIndex,
      pageSize,
      sortBy: fp.camelCase(sortBy),
      sortOrder,
      count
    });
  }
  
  async findByUser(userId, userType, filterByBookingID = null, filters = {} ) { 
    const sortBy     = 'bookings.id';
    const sortOrder  = 'DESC';
    const pageIndex  = filters.page ? filters.page : 1 ;
    const pageSize   = fp.getOr(50, 'page_size', filters); 
    let count        = fp.getOr(0, 'count', filters);  
 
    const { Booking } = this.server.models(); 
    let search;
    const filterID = parseInt(filterByBookingID);

    if( filterID  > 0 ){
       search = userType  === 'Hirer' ? { hirer_id : userId, 'bookings.id': filterID   } : { owner_id : userId, 'bookings.id' : filterID    }; 
    }else{
      search = userType  === 'Hirer' ? { hirer_id : userId  } : { owner_id : userId  }; 
    }
 
    const owner_hirer = userType === 'Hirer' ? 'bookings.owner_id' : 'bookings.hirer_id';  

    if(count === 0){
        const temp_result = await Booking.query()
                    .select('vehicles.vehicle_name as vehicleName', 'users.id as userId','users.first_name as userLastName', 'users.last_name as userFirstName','users.email as ownerEmail ','bookings.*')
                    .join('users', 'users.id', owner_hirer)
                    .join('vehicles', 'vehicles.id', 'bookings.vehicle_id')
                    .where(search);
         count = Math.ceil(temp_result.length / pageSize);
    }

 


    const result = await Booking.query()
    .select('vehicles.vehicle_name as vehicleName', 'users.id as userId','users.first_name as userLastName', 'users.last_name as userFirstName','users.email as ownerEmail ','bookings.*')
    .join('users', 'users.id', owner_hirer)
    .join('vehicles', 'vehicles.id', 'bookings.vehicle_id')
    .where(search) 
    .page(pageIndex - 1, pageSize)
    .orderBy(sortBy, sortOrder);

    if (fp.isNil(result)) {
      return Boom.notFound();
    } 
    return Response.create(result, {
      page: pageIndex,
      pageSize,
      sortBy: fp.camelCase(sortBy),
      sortOrder,
      count
    });
  }
 


  async delete(id){
   return await Booking.query().where( { id}).del(); 
  } 

  async updateBookingDetails(id, payload = {}) {
    try {
      const { Booking } = this.server.models();

      const query = await Booking
        .query() 
        .patchAndFetchById(id, payload);

      if (fp.isNil(query)) {
        return Boom.notFound();
      }

      return Response.create(query);
    }
    catch (error) {
      return Response.error(error);  
    }
  }  


 //STEP 0: request booking calendar form 
  async requestBooking(request, user){ 
    let { payload } = request;
    const { Booking } = this.server.models();  
 
    payload['step']             = 1;  
    payload['version']          = 2; //cnc version 2. 2 can process payout and reversal. version 1, we manual transfer via stripe
    payload['status'] = 'request-approval';   

    // TODO: it should be configurable later 
    
 
    
    /*
    const booking_cost   = payload.booking_cost;  
    const total_addons_amount   = payload.total_addons_amount;   
    const commission_rate = 10;  //10% - new site. old site is 15%
    const prod_commission = 0.90; //15% is the default deductible commission. owner gets 90%.
    const insurance_fee  = payload['insurance_fee'];
    const total_booking_cost  = (booking_cost + total_addons_amount); 
    const total_earnings = (  total_booking_cost * prod_commission) + ( insurance_fee * 0.90);   //+90% insurance fee 
    const total_commission = ( total_booking_cost - (total_booking_cost  * prod_commission)  ) + ( insurance_fee * 0.10);  //cnc gets 15 comission from booking cost and get 10% from insurance fee    
    payload['total_earnings']   = total_earnings; 
    payload['commission']       = commission_rate;  //15 default 
    payload['total_commission'] = total_commission;  //total earnings?  
    */


    payload['is_refunded']      = 0; 
    payload['tax_amount']       = 0;  

 
    const params = {
      uuid : uuidv4(), 
      total_balance: payload.total_amount,  
      date_requested:  new Date(), 
      full_amount_due:  0,      
      initial_amount_due:  0, 
      final_amount_due:  0,   ...payload};    
    const booking = await Booking.query().insert(params);       

     
   
     
    return Response.create(booking);
  } 

  //STEP 2: booking process - confirm booking    - subject for approval 
  async updateBooking(request, user) {
    let { payload } = request; 
    const { Booking  } = this.server.models();  
 
    payload['step']  = 2; 
    payload['status'] = 'request-approval';  
    const count_days_to_start = Helper.countDays( Helper.today() , payload['start_date']); 
    payload['payment_type'] = count_days_to_start < 30 ? 'full' : payload['payment_type']; //force full if less than 30days 
    payload['is_nopayment_data'] = 0;
 
  


    let booking  = await Booking.query().findOne( { uuid: payload.uuid } );        

    booking = { ...booking, ...payload };  
 
  



    const result = await Booking.query().where({uuid : payload.uuid } ).update(booking);       

    if(booking){ 
      Alerts.sendBookingRequestNotifications(await this.getNotificationVariables(request, booking.id));     
    }

    return Response.create(booking);
  } 
 

  //STEP 3 -4: booking process  -drivers license signature 
  async confirmContract(uuid, contract_url,request ){  
    //throw "Error Here";
    const { Booking, Payment } = this.server.models(); 
    let booking  = await Booking.query().findOne( { uuid } );        
    booking.step = 4; //after confirm, user should now can access payment screen at step 3.   
    

    //next payment flag
    if(booking.payment_type === 'partial'){   // if partial, starts with deposit 
       booking.upcoming_payment = 'deposit';  
    }else{
       booking.upcoming_payment = 'full';
    }

    await Booking.query().where(  'uuid' , '=', uuid).update(booking);      
  
    
  }


  
   //STEP 4-5: process payment for hirer to pay the booking. 
   async processPayment(request,uuid){       
    //NOTE: owner only gets the money after completting the job but will rely on the total_earnings (with commission deducted) field which is already computed here    
    const {stripeService, userService} = request.services();      
    const { Booking, Payment  } = this.server.models(); 
    let booking  = await Booking.query().findOne( { uuid   } );
    const booking_id = booking.id; 
    const card_id = booking.card_id;      
    const user_id = booking.hirer_id;  

    if(!card_id){
      throw "this has no card id defined to process payment."; 
    }else{ 
          
          let today = new Date();    
          let paymentType = 'full-payment';
          let amount = 0;
          let bond_amount = 0; 
          let target_payment = booking.upcoming_payment;

          if(booking.payment_type !== 'partial'){  
              //full payment 
              booking.upcoming_payment = 'complete';
              booking.status = 'paid';   
              booking.full_payment_paid = today;           
              booking.step = 5; //paid step
              amount =  booking.total_amount;  
              bond_amount = booking.bond_amount;  
          } else{ 
              //deposit payment or final payment   
              const final_payment =  booking.total_addons_amount + booking.booking_cost + (booking.bond_amount/2);   
              const initial_payment =  booking.insurance_fee + booking.booking_fee + (booking.bond_amount/2);
              const is_initial_deposit = !booking.initial_payment_paid ? true : false;
              bond_amount =  (booking.bond_amount/2);
      
              if(is_initial_deposit){//1. partial will be half of the bond amount.  
                booking.initial_payment_paid = today;
                booking.upcoming_payment = 'final';
                booking.status = 'partial-payment';                    
                amount = initial_payment;   
                paymentType = 'initial-deposit';
              }else{   //2. final payment will be :  2nd-half bond + (booking_cost) + booking_fee. 
                booking.status = 'paid';  
                booking.upcoming_payment = 'complete';
                booking.final_payment_paid = today;
                booking.step = 5; //paid step
                amount = final_payment;   
                paymentType = 'final-payment';  
              }   
          } 
 
          const stripe_customer_id = await userService.getStripeCustomerId(user_id);   
          let payment = { booking_id : booking.id, user_id : booking.hirer_id, card_id : booking.card_id, payment_type: 'booking-payment', amount , status : 'complete' , flag :  target_payment };

          if(stripe_customer_id){  
              const _payment = { date_transacted:  new Date(), user_id, paymentType, cardId : card_id, amount,  description : "Caravan & Camping Hire", booking_id : booking.id, bond: bond_amount };  
              const payment_result = await stripeService.chargeHirer(stripe_customer_id, _payment);       
              if(payment_result){   
                  let stripe_transaction_id = payment_result.id; 

                  payment = { stripe_transaction_id , ...payment}; 
                  await Payment.query().insert(payment);     
                
                  payment['payment_type'] = 'bond-payment';  
                  payment['status']       = 'pending'; 
                  payment['amount']       = bond_amount;  
                  //bond 
                  await Payment.query().insert(payment);      

                  //bond holding
                  payment['payment_type'] = 'bond-holding';   
                  payment['stripe_transaction_id'] = '';    
                  
                  await Payment.query().insert(payment);       
 

                await Booking.query().where({  id : booking_id }).update(booking);    //made update if stripe went we ll. 
                Alerts.sendBookingPaymentNotifications(await this.getNotificationVariables(request, booking.id));    
                return true; 
              }else{ 
                throw "transaction failed"; 
              } 
          }else{ 
                throw "no stripe acount id"; 
          }
      
    }

    return false; 
  }
 

  async findById(id) {
    const { Booking } = this.server.models();


    const query = await Booking.query().where({ id });

    if (fp.isNil(query)) {
      return Boom.notFound();
    }

    return Response.create(query);
  }






  async updateStatus(id,status){
    //this.getStatus();
    try {
      const { Booking } = this.server.models(); 
      const query = await Booking
        .query()
        .where({ 'id': id })
        
        .update({ status : status });

      if (fp.isNil(query)) {
        return Boom.notFound();
      }

      return Response.create(query);
    }
    catch (error) {
      return Response.error("Error :" + error); 
    }
  } 

  async getBookings(filters = {}) {
    try {
      const { Booking } = this.server.models();

      const sortBy = fp.getOr('created_at', 'sort_by', filters);
      const sortOrder = fp.getOr('ASC', 'sort_order', filters);
      const pageIndex = fp.getOr(0, 'page', filters);
      const pageSize = fp.getOr(100, 'page_size', filters);

      const pagingSortingKeys = ['page', 'page_size', 'sort_order', 'sort_by'];
      const filterParams = fp.omit(pagingSortingKeys)(filters);
      const query = queryBuilder(Booking.query(), filterParams);

      const bookings = await query 
        .page(pageIndex, pageSize)
        .orderBy(sortBy, sortOrder);

      return Response.create(bookings, {
        page: pageIndex,
        pageSize,
        sortBy: fp.camelCase(sortBy),
        sortOrder,
        count: fp.get('results.length', bookings)
      });
    }
    catch (error) {
      throw error;
    }
  }


  
 

};
