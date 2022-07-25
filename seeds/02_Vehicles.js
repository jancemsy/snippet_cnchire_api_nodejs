'use strict';

const { stringify } = require('hoek');
const Joi = require('joi');
const fp = require('lodash/fp');
 

exports.seed = async function (knex) {

  const table_name = 'vehicles';
  const schema = require('../models/Vehicles').joiSchema;


  

  const images_set1 = [ { image : 'http://localhost:3001/samples/1.jpg' }, 
                        { image : 'http://localhost:3001/samples/2.jpg' },
                        { image : 'http://localhost:3001/samples/3.jpg' },
                        { image : 'http://localhost:3001/samples/4.jpg' },
                        { image : 'http://localhost:3001/samples/5.jpg' } ];  

const images_set2 = [ { image : 'http://localhost:3001/samples/2.jpg' }, 
                        { image : 'http://localhost:3001/samples/3.jpg' },
                        { image : 'http://localhost:3001/samples/4.jpg' },
                        { image : 'http://localhost:3001/samples/5.jpg' },
                        { image : 'http://localhost:3001/samples/1.jpg' } ]; 

const images_set3 = [ { image : 'http://localhost:3001/samples/3.jpg' }, 
                        { image : 'http://localhost:3001/samples/4.jpg' },
                        { image : 'http://localhost:3001/samples/5.jpg' },
                        { image : 'http://localhost:3001/samples/1.jpg' },
                        { image : 'http://localhost:3001/samples/2.jpg' } ]; 

const images_set4 = [ { image : 'http://localhost:3001/samples/4.jpg' }, 
                        { image : 'http://localhost:3001/samples/5.jpg' },
                        { image : 'http://localhost:3001/samples/1.jpg' },
                        { image : 'http://localhost:3001/samples/2.jpg' },
                        { image : 'http://localhost:3001/samples/3.jpg' } ]; 

const images_set5 = [ { image : 'http://localhost:3001/samples/5.jpg' }, 
                        { image : 'http://localhost:3001/samples/1.jpg' },
                        { image : 'http://localhost:3001/samples/2.jpg' },
                        { image : 'http://localhost:3001/samples/3.jpg' },
                        { image : 'http://localhost:3001/samples/4.jpg' } ]; 

 
                    
                    
  const rows = [
 
    {
      id: 1,
      vehicle_name: 'TAS Copy 2 - 2009 Toyota Hiace Automatic High Top Campervan',
      user_id: 6,
      description: 'Tas cosy 2 is a automatic high top 3 berth Campervan suitable for 2 adults and 1 child and comes equipped with all the items you will require to enjoy your holiday travels around Tasmania. This great campervan has a solar system which enables extended free camping.',
      vehicle_type: 'Campervan',
      hire_type: 'Hirer Drive',
      location: 'Devonport TAS, Australia',
      state: 'Tasmania',
      state_code: 'TAS',
      number_of_travellers: 3, 
      price_per_day: 50.50,
      security_bond : 1000 , 
      score : 4, 

      images : JSON.stringify(images_set5),
 
 
      
         thumbnail: images_set5[0].image,
         amenities : '3,8,16,19',
         addon_amenities :   JSON.stringify( [ { amenity: 6, price: 10.50 }, 
                                              { amenity: 7 , price: 22.40 } , 
                                              { amenity: 4 , price: 50.40 },
                                              { amenity: 3 , price: 100.40 }, 
                                           ]),   

      condition_min_driver_age      : 25,
      condition_permitted_road_types: 'Sealed/Surfaced Roads, Graded Gravel/Dirt Roads',
      condition_river_crossing      : true, 
      condition_beach_access        : true,  
      condition_outback_roads       : true, 
      condition_specific_terms      : 'Any intention to travel on Graded or Ungraded Gravel/Dirt Roads OR 4WD/Off-Road Tracks/Trails must have their routes planned and preapproved by the owner prior to travel',
                
      vehicle_make                  : 'Toyota',
      vehicle_model                 : 'Hiace',
      vehicle_year_manufactured     :  2009, 
      vehicle_sleeps                :  3,
      vehicle_length                : '6m',
      vehicle_width                 : '2m',
      vehicle_family_friendly       : true,
      vehicle_pet_friendly          : true, 
               
               
      towing_tare                   :  '2200kg',
      towing_atm                    :  '2900kg',
      towing_towball_weight         :  '160kg',
      towing_plug                   :  '7 Pin Flat',

      
      is_active: true,
      is_deleted: false,
      is_approved: true, 
      created_at: '2020-07-23 08:01:11',
      updated_at: '2020-07-23 09:00:01',
      lat: '-41.1770585',
      lng: '146.3451775',
      status : 'active'
    },
    {
      id: 2,
      vehicle_name: '2019 Avan Aspire 499 Bunk',
      user_id: 6,
      description: 'This Avan is located in Devonport 5 minutes from the spirit of Tasmania terminal ready to hook up and explore Tasmania. Extra items that can be included for a small fee for ease and or day trips are a weber bbq, waeco 12v fridge',
      vehicle_type: 'Caravan',
      hire_type: 'Owner Deliver',
      location: 'Legana TAS, Australia',
      state: 'Tasmania',
      state_code: 'TAS',
      number_of_travellers: 5, 
      price_per_day: 100,
      security_bond : 500 , 
      score : 3, 
      images : JSON.stringify(images_set1),  
      thumbnail: images_set1[0].image,
 
       amenities : '1,2,3,4',
       addon_amenities :   JSON.stringify( [ { amenity: 8, price: 10.50 }, 
                                            { amenity: 9, price: 22.40 } , 
                                            { amenity: 10 , price: 50.40 },
                                            { amenity: 11 , price: 100.40 }, 
                                         ]),   

         condition_min_driver_age      : 25,
         condition_permitted_road_types: 'Sealed/Surfaced Roads, Graded Gravel/Dirt Roads',
         condition_river_crossing      : true, 
         condition_beach_access        : true, 
         condition_outback_roads       : true, 
         condition_specific_terms      : 'Any intention to travel on Graded or Ungraded Gravel/Dirt Roads OR 4WD/Off-Road Tracks/Trails must have their routes planned and preapproved by the owner prior to travel',
                   
         vehicle_make                  : 'Toyota',
         vehicle_model                 : 'Hiace',
         vehicle_year_manufactured     :  2019, 
         vehicle_sleeps                :  3,
         vehicle_length                : '6m',
         vehicle_width                 : '2m',
         vehicle_family_friendly       : true,
         vehicle_pet_friendly          : true, 
                  
                  
         towing_tare                   :  '2200kg',
         towing_atm                    :  '2900kg',
         towing_towball_weight         :  '160kg',
         towing_plug                   :  '7 Pin Flat',

    
      is_active: true,
      is_deleted: false,
      is_approved: true, 
      created_at: '2020-07-23 08:01:11',
      updated_at: '2020-07-23 09:00:01',
      lat: '-41.366667',
      lng: '147.05',
      status : 'active'
    },
    {
      id: 3,
      vehicle_name: 'Allstar 4WD Campervan No. 2017',
      user_id: 6,
      description: 'Our 4WD camper is perfectly suited to the outdoor adventurer who wants the ability to go beyond the bitumen road if they desire. Our camper comes fully equipped with everything you need to travel the Australian outback, begin your journey with the confidence of driving Toyota’s legendary reliability.',
      vehicle_type: 'Campervan',
      hire_type: 'Owner Deliver',
      location: 'Malaga WA, Australia',
      state: 'Western Australia',
      state_code: 'WA',
      number_of_travellers: 4, 
      price_per_day: 185,
      security_bond : 500 , 
      score : 5, 

      images : JSON.stringify(images_set2),
      thumbnail: images_set2[0].image,

      /*
      images : JSON.stringify(
        [{ image: 'https://cnchire.com.au/wp-content/uploads/2018/10/4188-3D37D5F4-12B3-4273-A3C9-DD8B21A8B7DA-500x374.png'}, 
         { image : 'https://cnchire.com.au/wp-content/uploads/2018/10/4188-31B43DE5-B862-49D1-A00F-8F193EAE63A5-500x374.png'} ,
         { image : 'https://cnchire.com.au/wp-content/uploads/2018/10/4188-4760EBB8-44E5-4FE9-ADB6-F3484CB925F1-500x374.png'},
         { image : 'https://cnchire.com.au/wp-content/uploads/2018/10/4188-BFC24BAF-ED31-475D-9565-D3D1564A469D-500x374.png'},
         { image : 'https://cnchire.com.au/wp-content/uploads/2018/10/4188-91B7CDE3-9E04-4B65-AE9A-A6EC591128E1-500x374.png'} ] ), 
         */


       amenities : '5,11,3,10',
       addon_amenities :   JSON.stringify( [ { amenity: 8, price: 10.50 }, 
                                            { amenity: 11 , price: 22.40 } , 
                                            { amenity: 12 , price: 50.40 },
                                            { amenity: 13 , price: 100.40 }, 
                                         ]),   

 
         condition_min_driver_age      : 25,
         condition_permitted_road_types: 'Sealed/Surfaced Roads, Graded Gravel/Dirt Roads',
         condition_river_crossing      : true, 
         condition_beach_access        : true, 
         condition_outback_roads       : true, 
         condition_specific_terms      : 'Any intention to travel on Graded or Ungraded Gravel/Dirt Roads OR 4WD/Off-Road Tracks/Trails must have their routes planned and preapproved by the owner prior to travel',
                   
         vehicle_make                  : 'Toyota',
         vehicle_model                 : 'Hiace',
         vehicle_year_manufactured     :  2017, 
         vehicle_sleeps                :  3,
         vehicle_length                : '6m',
         vehicle_width                 : '2m',
         vehicle_family_friendly       : true,
         vehicle_pet_friendly          : true, 
                  
                  
         towing_tare                   :  '2200kg',
         towing_atm                    :  '2900kg',
         towing_towball_weight         :  '160kg',
         towing_plug                   :  '7 Pin Flat',


      is_active: true,
      is_deleted: false,
      is_approved: true, 
      created_at: '2020-07-23 08:01:11',
      updated_at: '2020-07-23 09:00:01',
      lat: '-31.8555873',
      lng: '115.8934621',
      status : 'active'
    },
    {
      id: 4,
      vehicle_name: 'Jassy - Teardrop Camper 1990',
      user_id: 6,
      description: 'Jassy is our cool blue teardrop camper with red mudguards and finished in jarrah timber. It has a queen size bed which converts to a lounge area. It is fitted with all mod cons, including a rotating tv console.',
      vehicle_type: 'Camper Trailer',
      hire_type: 'Owner Deliver',
      location: 'Gosnells WA, Australia',
      state: 'Western Australia',
      state_code: 'WA',
      number_of_travellers: 2, 
      price_per_day: 100,
      security_bond : 500 , 
      score : 2, 
      
      images : JSON.stringify(images_set3),
      thumbnail: images_set3[0].image,

      /*images : JSON.stringify(
        [{ image: 'https://cnchire.com.au/wp-content/uploads/2018/09/71-Jassy-copy-500x374.jpg'}, 
         { image : 'https://cnchire.com.au/wp-content/uploads/2018/09/71-IMG_2809-500x374.jpg'} ,
         { image : 'https://cnchire.com.au/wp-content/uploads/2018/09/71-IMG_2812-500x374.jpg'},
         { image : 'https://cnchire.com.au/wp-content/uploads/2018/09/71-IMG_2815-500x374.jpg'},
         { image : 'https://cnchire.com.au/wp-content/uploads/2018/09/71-thumb_IMG_1881_1024-500x374.jpg'} ] ),  
         */ 

         amenities : '12,11,13,15',
         addon_amenities :   JSON.stringify( [ { amenity: 14, price: 10.50 }, 
                                              { amenity: 15 , price: 22.40 } , 
                                              { amenity: 16 , price: 50.40 },
                                              { amenity: 22 , price: 100.40 }, 
                                           ]),   
  
          
         condition_min_driver_age      : 25,
         condition_permitted_road_types: 'Sealed/Surfaced Roads, Graded Gravel/Dirt Roads',
         condition_river_crossing      : true, 
         condition_beach_access        : true, 
         condition_outback_roads       : true, 
         condition_specific_terms      : 'Any intention to travel on Graded or Ungraded Gravel/Dirt Roads OR 4WD/Off-Road Tracks/Trails must have their routes planned and preapproved by the owner prior to travel',
                   
         vehicle_make                  : 'Toyota',
         vehicle_model                 : 'Hiace',
         vehicle_year_manufactured     :  1990, 
         vehicle_sleeps                :  3,
         vehicle_length                : '6m',
         vehicle_width                 : '2m',
         vehicle_family_friendly       : true,
         vehicle_pet_friendly          : true, 
                  
                  
         towing_tare                   :  '2200kg',
         towing_atm                    :  '2900kg',
         towing_towball_weight         :  '160kg',
         towing_plug                   :  '7 Pin Flat',


      is_active: true,
      is_deleted: false,
      is_approved: true,
      created_at: '2020-07-23 08:01:11',
      updated_at: '2020-07-23 09:00:01',
      lat: '-32.0823022',
      lng: '115.9902668',
      status : 'active'
    },
    {
      id: 5,
      vehicle_name: 'Kimberly Kamper 2000 Limited Edition',
      user_id: 6,
      description: 'Kimberly Kamper Platinum the gold standard in campers. Easy towing and no electric brakes required due to weight. Suitable for camp sites and free camping.',
      vehicle_type: 'Camper Trailer',
      hire_type: 'Owner Deliver',
      location: 'Mount Low QLD, Australia',
      state: 'Queensland',
      state_code: 'QLD',
      number_of_travellers: 4, 
      price_per_day: 115,
      security_bond : 500 , 
      score : 1, 
      images : JSON.stringify(images_set4),
      thumbnail: images_set4[0].image,

      /*
      images : JSON.stringify(
        [{ image: 'https://cnchire.com.au/wp-content/uploads/2018/09/11889560_10207908904705323_588005117574141575_n-500x374.jpg'}, 
         { image : 'https://cnchire.com.au/wp-content/uploads/2018/09/11870791_10207908905025331_6926158884972836581_n-500x374.jpg'} ,
         { image : 'https://cnchire.com.au/wp-content/uploads/2018/09/11863490_10207908905425341_7190989932718828714_n-500x374.jpg'},
         { image : 'https://cnchire.com.au/wp-content/uploads/2018/09/11870875_10207908905705348_1580839126307008283_n-500x374.jpg'},
         { image : 'https://cnchire.com.au/wp-content/uploads/2018/09/11885166_10207908905265337_1422245706083424184_n-500x374.jpg'} ] ),  
         */


         amenities : '23,21,12,20',
         addon_amenities :   JSON.stringify( [ { amenity: 3, price: 10.50 }, 
                                              { amenity: 5 , price: 22.40 } , 
                                              { amenity: 7 , price: 50.40 },
                                              { amenity: 8, price: 100.40 }, 
                                           ]),   
  
         condition_min_driver_age      : 25,
         condition_permitted_road_types: 'Sealed/Surfaced Roads, Graded Gravel/Dirt Roads',
         condition_river_crossing      : true, 
         condition_beach_access        : true, 
         condition_outback_roads       : true, 
         condition_specific_terms      : 'Any intention to travel on Graded or Ungraded Gravel/Dirt Roads OR 4WD/Off-Road Tracks/Trails must have their routes planned and preapproved by the owner prior to travel',
                   
         vehicle_make                  : 'Toyota',
         vehicle_model                 : 'Hiace',
         vehicle_year_manufactured     :  2000, 
         vehicle_sleeps                :  3,
         vehicle_length                : '6m',
         vehicle_width                 : '2m',
         vehicle_family_friendly       : true,
         vehicle_pet_friendly          : true, 
                  
                  
         towing_tare                   :  '2200kg',
         towing_atm                    :  '2900kg',
         towing_towball_weight         :  '160kg',
         towing_plug                   :  '7 Pin Flat',

 
      is_active: true,
      is_deleted: false,
      is_approved: true, 
      created_at: '2020-07-23 08:01:11',
      updated_at: '2020-07-23 09:00:01',
      lat: '-19.2226979',
      lng: '146.6794456',
      status : 'active'
    } ,
    {
      id: 6,
      vehicle_name: 'Escudo Estrada',
      user_id: 6,
      description: 'Truck Pickup, can carry 5 cary passenger ',
      vehicle_type: 'Truck Pickup',
      hire_type: 'Owner Deliver',
      location: 'Mount Low QLD, Australia',
      state: 'Queensland',
      state_code: 'QLD',
      number_of_travellers: 4, 
      price_per_day: 85,
      security_bond : 500 , 
      score : 1, 
      images : JSON.stringify(images_set2), 
      thumbnail: images_set2[0].image,

         amenities : '23,21,12,20',
         addon_amenities :   JSON.stringify( [ { amenity: 2, price: 10.50 }, 
                                              { amenity: 1 , price: 22.40 } , 
                                              { amenity: 3 , price: 50.40 },
                                              { amenity: 4 , price: 100.40 }, 
                                           ]),   
  
         condition_min_driver_age      : 25,
         condition_permitted_road_types: 'Sealed/Surfaced Roads, Graded Gravel/Dirt Roads',
         condition_river_crossing      : true, 
         condition_beach_access        : true, 
         condition_outback_roads       : true, 
         condition_specific_terms      : 'Any intention to travel on Graded or Ungraded Gravel/Dirt Roads OR 4WD/Off-Road Tracks/Trails must have their routes planned and preapproved by the owner prior to travel',
                   
         vehicle_make                  : 'Toyota',
         vehicle_model                 : 'Hiace',
         vehicle_year_manufactured     :  2000, 
         vehicle_sleeps                :  3,
         vehicle_length                : '6m',
         vehicle_width                 : '2m',
         vehicle_family_friendly       : true,
         vehicle_pet_friendly          : true, 
                  
                  
         towing_tare                   :  '2200kg',
         towing_atm                    :  '2900kg',
         towing_towball_weight         :  '160kg',
         towing_plug                   :  '7 Pin Flat',

 
      is_active: true,
      is_deleted: false,
      is_approved: true, 
      created_at: '2020-07-23 08:01:11',
      updated_at: '2020-07-23 09:00:01',
      lat: '-19.2226979',
      lng: '146.6794456',
      status : 'active'
    } ,
    {
      id: 7,
      vehicle_name: 'Toyota Canter',
      user_id: 6,
      description: 'Just a random truck Pickup. Good for small family. ',
      vehicle_type: 'Truck Pickup',
      hire_type: 'Owner Deliver',
      location: 'Mount Low QLD, Australia',
      state: 'Queensland',
      state_code: 'QLD',
      number_of_travellers: 4, 
      price_per_day: 165,
      security_bond : 500 , 
      score : 2, 
      images : JSON.stringify(images_set3), 
      thumbnail: images_set3[0].image,

         amenities : '23,21,12,20',
         addon_amenities :   JSON.stringify( [ { amenity: 3, price: 10.50 }, 
                                              { amenity: 4 , price: 22.40 } , 
                                              { amenity: 5 , price: 50.40 },
                                              { amenity: 7 , price: 100.40 }, 
                                           ]),   
  
         condition_min_driver_age      : 25,
         condition_permitted_road_types: 'Sealed/Surfaced Roads, Graded Gravel/Dirt Roads',
         condition_river_crossing      : true, 
         condition_beach_access        : true, 
         condition_outback_roads       : true, 
         condition_specific_terms      : 'Any intention to travel on Graded or Ungraded Gravel/Dirt Roads OR 4WD/Off-Road Tracks/Trails must have their routes planned and preapproved by the owner prior to travel',
                   
         vehicle_make                  : 'Toyota',
         vehicle_model                 : 'Hiace',
         vehicle_year_manufactured     :  2000, 
         vehicle_sleeps                :  3,
         vehicle_length                : '6m',
         vehicle_width                 : '2m',
         vehicle_family_friendly       : true,
         vehicle_pet_friendly          : true, 
                  
                  
         towing_tare                   :  '2200kg',
         towing_atm                    :  '2900kg',
         towing_towball_weight         :  '160kg',
         towing_plug                   :  '7 Pin Flat',

 
      is_active: true,
      is_deleted: false,
      is_approved: true, 
      created_at: '2020-07-23 08:01:11',
      updated_at: '2020-07-23 09:00:01',
      lat: '-19.2226979',
      lng: '146.6794456',
      status : 'active'
    }  ,
    {
      id: 8,
      vehicle_name: 'Toyota Fortuner',
      user_id: 6,
      description: 'Just a test pending vehicle',
      vehicle_type: 'Truck Pickup',
      hire_type: 'Owner Deliver',
      location: 'Mount Low QLD, Australia',
      state: 'Queensland',
      state_code: 'QLD',
      score : 0, 
      number_of_travellers: 4, 
      price_per_day: 165,
      security_bond : 500 , 
      images : JSON.stringify(images_set3), 
      thumbnail: images_set3[0].image,

         amenities : '23,21,12,20',
         addon_amenities :   JSON.stringify( [ { amenity: 14, price: 10.50 }, 
                                              { amenity: 12, price: 22.40 } , 
                                              { amenity: 13 , price: 50.40 },
                                              { amenity: 2 , price: 100.40 }, 
                                           ]),   
  
         condition_min_driver_age      : 25,
         condition_permitted_road_types: 'Sealed/Surfaced Roads, Graded Gravel/Dirt Roads',
         condition_river_crossing      : true, 
         condition_beach_access        : true, 
         condition_outback_roads       : true, 
         condition_specific_terms      : 'Any intention to travel on Graded or Ungraded Gravel/Dirt Roads OR 4WD/Off-Road Tracks/Trails must have their routes planned and preapproved by the owner prior to travel',
                   
         vehicle_make                  : 'Toyota',
         vehicle_model                 : 'Hiace',
         vehicle_year_manufactured     :  2000, 
         vehicle_sleeps                :  3,
         vehicle_length                : '6m',
         vehicle_width                 : '2m',
         vehicle_family_friendly       : true,
         vehicle_pet_friendly          : true, 
                  
                  
         towing_tare                   :  '2200kg',
         towing_atm                    :  '2900kg',
         towing_towball_weight         :  '160kg',
         towing_plug                   :  '7 Pin Flat',

 
      is_active: true,
      is_deleted: false,
      is_approved: false, 
      created_at: '2020-07-23 08:01:11',
      updated_at: '2020-07-23 09:00:01',
      lat: '-19.2226979',
      lng: '146.6794456',
      status : 'active'
    } 
  ];
 
  return knex(table_name)
  .then(async () => {
    try {
      const list = rows.map((row) => {
        const item = Joi.validate(row, schema);
        const error = fp.get('error', item); 

        if (!fp.isEmpty(error)) {
          throw error;
        }

        return item.value;
      });
 

      const result = await knex.insert(list).into(table_name); 
      try{ //postgres indexing  fix. try catch because this doesnt work for mysql 
        await knex.raw("alter sequence 	" + table_name + "_id_seq restart with "+ (rows.length  + 1) +"; ") ;   
      }catch(e){ 
      }
      return result;

    }
    catch (error) {
      if (error.message.indexOf('violates unique constraint "'+table_name+'_pkey"') > -1){
        return console.log('SEED ALREADY EXISTS');
      }

      throw error;
    }
  });
};