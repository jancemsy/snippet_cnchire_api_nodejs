'use strict';

const Joi = require('joi');
const fp = require('lodash/fp');


exports.seed = function (knex) {

  const table_name = 'vehicle_searches';
  const schema = require('../models/VehicleSearches').joiSchema;

  const rows = [
    {
      id: 1,
      user_id: 6, 
      vehicle_id: 1, 
      created_at: new Date()  
    },
    {
      id: 2,
      user_id : 6,
      vehicle_id: 1,  
      created_at: new Date()  
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
