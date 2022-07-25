'use strict';

const Joi = require('joi');
const fp = require('lodash/fp');


exports.seed = function (knex) {

  const table_name = 'notifications';
  const schema = require('../models/Notification').joiSchema;

  const rows = [
    {
      id: 1,
      user_id: 1, 
      message: "Welcome to cnc",
      page_link: "/dashboard/learn-more" 
    },
    {
      id: 2,
      user_id: 2, 
      message: "Welcome to cnc",
      page_link: "/dashboard/learn-more" 
    },
    {
      id: 3,
      user_id: 3, 
      message: "Welcome to cnc",
      page_link: "/dashboard/learn-more" 
    } ,
    {
      id: 4,
      user_id: 4, 
      message: "Welcome to cnc",
      page_link: "/dashboard/learn-more" 
    } ,
    {
      id: 5,
      user_id: 5, 
      message: "Pending payment - booking #5",
      page_link: "/dashboard/bookings/5" 
    } ,
    {
      id: 6,
      user_id: 5, 
      message: "Pending payment - booking #4",
      page_link: "/dashboard/bookings/4" 
    } ,

    {
      id: 7,
      user_id: 5, 
      message: "Pending payment - booking #2",
      page_link: "/dashboard/bookings/2" 
    } ,

    {
      id: 8,
      user_id: 6, 
      message: "Hirer paid full - booking #1",
      page_link: "/dashboard/bookings/1" 
    } ,
    {
      id: 9,
      user_id: 6, 
      message: "Pending booking approval - booking #3",
      page_link: "/dashboard/bookings/3" 
    } , 
    {
      id: 10,
      user_id: 6, 
      message: "Booking #6 need complete remark",
      page_link: "/dashboard/bookings/6" 
    } ,
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

      //return 
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
