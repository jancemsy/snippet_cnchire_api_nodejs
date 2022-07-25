'use strict';

const Joi = require('joi');
const fp = require('lodash/fp');

exports.seed = function (knex) {

  const table_name = 'replies';
  const schema = require('../models/Replies').joiSchema;

  const rows = [
    {
      id: 1,
      body: 'Thank you for your inquiry! <br><br> Yes this is availble, would you like to rent?',
      to: 3,
      from: 2,
      thread: 1
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