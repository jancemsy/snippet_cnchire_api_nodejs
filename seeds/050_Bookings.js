'use strict';

const Joi = require('joi');
const fp = require('lodash/fp');
const moment = require('moment');

/*

  pending-approval
  pending-partial-payment
  pending-full-payment 
  pending-balance-payment  
  pending-owner-remark
  complete 

  STEP 1: request
  STEP 2: approved
  STEP 3: fully paid
  STEP 4: completed
*/




const  getDaysFromNow = function(days){
  var date = new Date();

  if(days < 0){ 
    date.setDate(date.getDate() - Math.abs(days));
  }else{
    date.setDate(date.getDate() + days);
  }
  return moment(date).format("YYYY-MM-DD");
}
 

const _addons = JSON.stringify( [
  { "amenity":"Portable Electronic Brake Control Hire", "price":100},
  { "amenity":"Portable 12v Fridge Hire","price":100}
]); 



//booking template 
const rows = [ 
  //CRONS DATA PENDING APPROVAL - OVERDUE 
  {   
    id : 1,
    hirer_id : 5, 
    owner_id : 6,
    vehicle_id: 3,
    payment_type: 'partial', 
    start_date: getDaysFromNow(-15), 
    end_date: getDaysFromNow(-10), 

    driver_name: 'james martinez',
    driver_dob: 'October 4, 1984',

    addons: '', 
    total_number_of_stay: 4,
    total_guest: 5, 
    total_addons_amount: 0,  
    rate_breakdown: null,
    total_applied_rate:  202,

    total_amount : 702, 
    total_balance : 702,
    bond_amount: 500,
    
    booking_fee :  0,  


    date_requested: getDaysFromNow(-20), 

    step : 1,    
    status: 'request-approval'
  },

  //CRONS DATA PENDING INITIAL PAYMENT 
  {  
    id : 2,
    hirer_id : 5, 
    owner_id : 6,      
    payment_type: 'partial',  
    driver_name: 'james martinez',
    driver_dob: 'October 4, 1984',
    addons: '', 
    vehicle_id: 2,
    total_number_of_stay: 4,
    total_guest: 5, 
    rate_breakdown: null,
    total_addons_amount: 0,  

    total_applied_rate:  400.00,

    total_amount : 900,  
    total_balance : 900, 
    bond_amount: 500,

    booking_fee :  0,  

    
    
    full_amount_due: 0, 
    initial_amount_due: 200.00 ,
    final_amount_due:  200.00, 

    full_payment_due:  null,
    initial_payment_due: getDaysFromNow(-1), //TRIGGER CRON INITIAL PAYMENT 
    final_payment_due: getDaysFromNow(31-5),  


    full_payment_paid:   null,
    initial_payment_paid: null,
    final_payment_paid: null, 

    start_date: getDaysFromNow(31),
    end_date: getDaysFromNow(35),  
    date_requested: getDaysFromNow(-5),
    date_approved: getDaysFromNow(-5),

    step : 2,   
    status: 'unpaid'
  },

 //CRONS DATA PENDING FINAL PAYMENT 
  {    
    id : 3,
    hirer_id : 5, 
    owner_id : 6,      
    payment_type: 'partial',  
    driver_name: 'james martinez',
    driver_dob: 'October 4, 1984',
    addons: '', 
    vehicle_id: 4,
    total_number_of_stay: 4,
    total_guest: 5, 

    total_applied_rate:  400,
    total_addons_amount: 0,  

    total_amount : 900,  
    total_balance : 450, 

    bond_amount: 500,
    
    rate_breakdown: null,
    booking_fee :  0,  


    
    full_amount_due: 0, 
    initial_amount_due: 450.00 ,
    final_amount_due:  450.00, 

    full_payment_due:  null,
    initial_payment_due: getDaysFromNow(-10),
    final_payment_due: getDaysFromNow(-2),

    full_payment_paid:   null,
    initial_payment_paid: getDaysFromNow(-10),
    final_payment_paid: null,


    start_date: getDaysFromNow(5),
    end_date: getDaysFromNow(10),  
    date_requested: getDaysFromNow(-15),
    date_approved: getDaysFromNow(-15),  

    step : 2,   
    status: 'partial-payment'
  },

//CRONS DATA PENDING FULL PAYMENT 
{   
id : 4,
hirer_id : 5, 
owner_id : 6,      
payment_type: 'full',  
driver_name: 'james martinez',
driver_dob: 'October 4, 1984',
addons: '', 
vehicle_id: 5,
total_number_of_stay: 4,
total_guest: 5, 
total_addons_amount: 0, 
rate_breakdown: null,
total_applied_rate:  400,
total_amount : 900,  
total_balance : 900,  

bond_amount: 500,

booking_fee :  0,  
   

full_amount_due: 900, 
initial_amount_due: 0 ,
final_amount_due:  0, 

full_payment_due:  getDaysFromNow(-2),
initial_payment_due: null,
final_payment_due: null,



full_payment_paid:   null,
initial_payment_paid: null,
final_payment_paid: null,


start_date: getDaysFromNow(5),
end_date: getDaysFromNow(10),  
date_requested: getDaysFromNow(-10),
date_approved: getDaysFromNow(-10),  

step : 2,   
status: 'partial-payment'
},





//CRONS DATA OVERDUE INITIAL PAYMENT  OVERDUE - passed final payment due ********** 
{  
id : 5,  
hirer_id : 5, 
owner_id : 6,      
payment_type: 'partial',  
driver_name: 'james martinez',
driver_dob: 'October 4, 1984',
addons: '', 
vehicle_id: 2,
total_number_of_stay: 4,
total_guest: 5, 
rate_breakdown: null,
total_addons_amount: 0,  

total_applied_rate:  400.00,

total_amount : 900,  
total_balance : 450, 
bond_amount: 500,

booking_fee :  0,  
  


full_amount_due: 0, 
initial_amount_due: 450.00 ,
final_amount_due:  450.00, 

full_payment_due:  null,
initial_payment_due: getDaysFromNow(-37), //TRIGGER CRON INITIAL PAYMENT 
final_payment_due: getDaysFromNow(-1),  


full_payment_paid:   null,
initial_payment_paid: null,
final_payment_paid: null, 

start_date: getDaysFromNow(5),
end_date: getDaysFromNow(10),  
date_requested: getDaysFromNow(-40),
date_approved: getDaysFromNow(-37),

step : 2,   
status: 'unpaid'
},



//CRONS DATA PENDING FINAL PAYMENT OVERDUE********** 
{    
  id : 6,
hirer_id : 5, 
owner_id : 6,      
payment_type: 'partial',  
driver_name: 'james martinez',
driver_dob: 'October 4, 1984',
addons: '', 
vehicle_id: 4,
total_number_of_stay: 4,
total_guest: 5, 

total_applied_rate:  400,
total_addons_amount: 0,  
total_amount : 900,  
total_balance : 450, 
bond_amount: 500,


rate_breakdown: null,
booking_fee :  0,  
  


full_amount_due: 0, 
initial_amount_due: 450.00 ,
final_amount_due:  450.00, 



full_payment_due:  null,
initial_payment_due: getDaysFromNow(-10),
final_payment_due: getDaysFromNow(-5),

full_payment_paid:   null,
initial_payment_paid: getDaysFromNow(-10),
final_payment_paid: null,


start_date: getDaysFromNow(-1),
end_date: getDaysFromNow(10),  
date_requested: getDaysFromNow(-15),
date_approved: getDaysFromNow(-15),  

step : 2,   
status: 'partial-payment'
},

//CRONS DATA PENDING FULL PAYMENT  OVERDUE********** 
{   
id : 7,  
hirer_id : 5, 
owner_id : 6,      
payment_type: 'full',  
driver_name: 'james martinez',
driver_dob: 'October 4, 1984',
addons: '', 
vehicle_id: 5,
total_number_of_stay: 4,
total_guest: 5, 
total_addons_amount: 0, 
rate_breakdown: null,
total_applied_rate:  400,
total_amount : 900,  
total_balance : 900,  
bond_amount: 500,

booking_fee :  0,  
  


full_amount_due: 900, 
initial_amount_due: 0 ,
final_amount_due:  0, 

full_payment_due:  getDaysFromNow(-5),
initial_payment_due: null,
final_payment_due: null,



full_payment_paid:   null,
initial_payment_paid: null,
final_payment_paid: null,


start_date: getDaysFromNow(-1),
end_date: getDaysFromNow(10),  
date_requested: getDaysFromNow(-10),
date_approved: getDaysFromNow(-10),  

step : 2,   
status: 'request-approved'
},




  

  {   
    id : 8,
    hirer_id : 5, 
    owner_id : 6,
    payment_type: 'full', 
    addons: JSON.stringify( [
      { "amenity":"Portable Electronic Brake Control Hire", "price":100},
      { "amenity":"Portable 12v Fridge Hire","price":100}
    ]),  
    vehicle_id: 1,  
    total_number_of_stay: 4,
    total_guest: 5,  
    total_addons_amount: 200,       
    driver_name: 'james martinez',
    driver_dob: 'October 4, 1984',

    total_amount : 2002.00,

    bond_amount: 1000,

    rate_breakdown: null,
    
    total_applied_rate:  802,
    total_balance : 0,    

    booking_fee :  0,  

    
    full_amount_due: 0, 
    initial_amount_due: 0 ,
    final_amount_due:  0, 

    full_payment_due:   null,
    initial_payment_due: null,
    final_payment_due: null,

    full_payment_paid:   null,
    initial_payment_paid: null,
    final_payment_paid: null, 

    start_date: '2021-02-13',
    end_date: '2020-02-15', 
    date_requested: '2020-12-16',
    date_approved: null, 
    date_completed:  null, 
    date_rejected: '2020-12-16',

    step : 1,   
    status: 'request-rejected'
  },
  { 
    id : 9,
    hirer_id : 5, 
    owner_id : 6,
    payment_type: 'full', 
    driver_name: 'james martinez',
    driver_dob: 'October 4, 1984',
    addons: '', 
    vehicle_id: 2,  
    total_number_of_stay: 4,
    total_guest: 5,  
    total_addons_amount: 200,       
    total_amount : 1502.00,

    bond_amount: 500,

    rate_breakdown: null,
    total_applied_rate:  802, 
    total_balance : 0,    

    booking_fee :  0,  

    
    full_amount_due: 0, 
    initial_amount_due: 0 ,
    final_amount_due:  0, 

    full_payment_due:   '2020-01-13',
    initial_payment_due: null,
    final_payment_due: null,

    full_payment_paid:   null,
    initial_payment_paid: null,
    final_payment_paid: null, 
    
    start_date: '2020-01-13', 
    end_date: '2020-01-15', 
    date_requested: '2020-01-01',
    date_approved: '2020-01-01',
    date_completed:  null, 
    date_rejected:  null, 
    date_forfeited: '2020-01-13',

    step : 2,   
    status: 'request-rejected'
  },
  { 
    id : 10,
    hirer_id : 5, 
    owner_id : 6,
    payment_type: 'full', 
    driver_name: 'james martinez',
    driver_dob: 'October 4, 1984',
    addons:  _addons, 
    vehicle_id: 1,  
    total_number_of_stay: 4,
    total_guest: 5,  
    total_addons_amount: 200,      
    rate_breakdown: null, 
    total_amount : 2002.00,
    total_applied_rate:  802.00,
    total_balance : 0,   
    bond_amount: 1000, 
    booking_fee :  0,  
 
    full_amount_due: 1002.00,       
    initial_amount_due: 0 ,
    final_amount_due:  0,

    full_payment_due:  '2020-01-04',
    initial_payment_due: null,
    final_payment_due: null,

    full_payment_paid:   '2020-01-04',
    initial_payment_paid: null,
    final_payment_paid: null,
    

    start_date: '2020-01-05',
    end_date: '2020-01-09', 
    date_requested: '2020-01-02',
    date_approved: '2020-01-03', 
    date_completed:  '2020-01-12', 

    step : 4,   
    status: 'completed'
  },
  {  
    id : 11,
    hirer_id : 5, 
    owner_id : 6,      
    payment_type: 'partial-payment',  
    driver_name: 'james martinez',
    driver_dob: 'October 4, 1984',
    addons: '', 
    vehicle_id: 2,
    total_number_of_stay: 4,
    total_guest: 5, 
    rate_breakdown: null,
    total_addons_amount: 0,  

    total_applied_rate:  400.00,

    total_amount : 900,  
    total_balance : 450, 

    bond_amount: 500,

    booking_fee :  0,  

    
    
    full_amount_due: 0, 
    initial_amount_due: 450.00 ,
    final_amount_due:  450.00, 

    full_payment_due:  null,
    initial_payment_due: getDaysFromNow(1), //initial payment is start date
    final_payment_due: getDaysFromNow(31-5), //startdate - 5days,


    full_payment_paid:   null,
    initial_payment_paid: null,
    final_payment_paid: null,
    
    

    start_date: getDaysFromNow(31),
    end_date: getDaysFromNow(35),  
    date_requested: getDaysFromNow(-5),
    date_approved: getDaysFromNow(-5),

    step : 2,   
    status: 'unpaid'
  },
  {   
    id : 12,
    hirer_id : 5, 
    owner_id : 6,
    vehicle_id: 3,
    payment_type: 'partial', 
    driver_name: 'james martinez',
    driver_dob: 'October 4, 1984',
    start_date: getDaysFromNow(40), 
    end_date: getDaysFromNow(45), 
    addons: '', 
    total_number_of_stay: 4,
    total_guest: 5, 
    total_addons_amount: 0,  
    rate_breakdown: null,
    total_applied_rate:  202,

    total_amount : 702, 
    total_balance : 702,
    bond_amount: 500,
    
    booking_fee :  0,  


    date_requested: getDaysFromNow(-5), 

    step : 1,    
    status: 'request-approval'
  },
  {    
    id : 13,
    hirer_id : 5, 
    owner_id : 6,      
    payment_type: 'partial',  
    driver_name: 'james martinez',
    driver_dob: 'October 4, 1984',
    addons: '', 
    vehicle_id: 4,
    total_number_of_stay: 4,
    total_guest: 5, 

    total_applied_rate:  400,
    total_addons_amount: 0,  
    total_amount : 900,  
    total_balance : 450,  
    bond_amount: 500,

    rate_breakdown: null,
    booking_fee :  0,  


    
    full_amount_due: 0, 
    initial_amount_due: 450.00 ,
    final_amount_due:  450.00, 

    full_payment_due:  null,
    initial_payment_due: getDaysFromNow(1),
    final_payment_due: getDaysFromNow(45-5),

    full_payment_paid:   null,
    initial_payment_paid: getDaysFromNow(1),
    final_payment_paid: null,


    start_date: getDaysFromNow(45),
    end_date: getDaysFromNow(50),  
    date_requested: getDaysFromNow(-10),
    date_approved: getDaysFromNow(-10),  

    step : 2,   
    status: 'partial-payment' //paid first payment
  },
  {   
    id : 14,
    hirer_id : 5, 
    owner_id : 6,      
    payment_type: 'full',  
    driver_name: 'james martinez',
    driver_dob: 'October 4, 1984',
    addons: '', 
    vehicle_id: 5,
    total_number_of_stay: 4,
    total_guest: 5, 
    total_addons_amount: 0, 
    rate_breakdown: null,
    total_applied_rate:  400,

    total_amount : 900,  
    total_balance : 900, 

    bond_amount: 500,

    booking_fee :  0,  


    
    full_amount_due: 900, 
    initial_amount_due: 0 ,
    final_amount_due:  0, 

    full_payment_due:  getDaysFromNow(15 - 5),
    initial_payment_due: null,
    final_payment_due: null,


    
    full_payment_paid:   null,
    initial_payment_paid: null,
    final_payment_paid: null,


    start_date: getDaysFromNow(15),
    end_date: getDaysFromNow(20),  
    date_requested: getDaysFromNow(1),
    date_approved: getDaysFromNow(1),  

    step : 2,   
    status: 'partial-payment'
  },

  {    
    id : 15,
    hirer_id : 5, 
    owner_id : 6,      
    payment_type: 'full',  
    driver_name: 'james martinez',
    driver_dob: 'October 4, 1984',
    addons: '', 
    vehicle_id: 5,
    total_number_of_stay: 4,
    total_guest: 5, 
    total_addons_amount: 0, 
    rate_breakdown: null,
    total_applied_rate:  202.00,
    total_amount : 702.00,    
    total_balance : 0,  
    bond_amount: 500,

    booking_fee :  0,  

    
    full_amount_due: 702.00, 
    initial_amount_due: 0 ,
    final_amount_due:  0, 

    full_payment_due:   getDaysFromNow(-8),
    initial_payment_due: null,
    final_payment_due: null,

    full_payment_paid:   getDaysFromNow(-6), 
    initial_payment_paid: null,
    final_payment_paid: null,

    start_date: getDaysFromNow(-5),
    end_date: getDaysFromNow(1),  
    date_requested: getDaysFromNow(-10),
    date_approved: getDaysFromNow(-10), 

    step : 3, //fully paid but owner needs to mark this as complete
    status: 'paid'
  }, 
];


 


exports.seed = function (knex) {

  const table_name = 'bookings';
  const schema = require('../models/Booking').joiSchema;

  
 
 

  return knex(table_name)
  .then(async () => {
    try {



      const list = rows.map((row) => {
        const item = Joi.validate(row, schema); const error = fp.get('error', item);  if (!fp.isEmpty(error)) { throw error; } 
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