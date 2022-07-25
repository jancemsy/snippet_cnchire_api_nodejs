'use strict';

const Joi = require('joi');
const fp = require('lodash/fp');

exports.seed = function (knex) {

  const table_name = 'message';
  const schema = require('../models/Message').joiSchema;

  const rows = [
    {
      id: 1,
      subject: 'Vehicle Inquiry',
      body: 'Hi good day, \n\n Just want to inquire is this available on the dates of January 02-08 2021? \n\n Hoping for your fast response about this. \n\n Thank you!',
      to: 3,
      from: 2,   
    },
    {
      id: 2,
      subject: 'Vehicle Inquiry',
      body: 'Hi good day, \n\n Just want to inquire is this available on the dates of January 02-08 2021? \n\n Hoping for your fast response about this. \n\n Thank you!',
      to: 5,
      from: 6,
    },
    { 
      id: 3,
      subject: 're:Vehicle Inquiry',
      body: 'Hi good day, the schedule is good',
      to: 6,
      from: 5,
    },  
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
