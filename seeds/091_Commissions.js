'use strict';

const Joi = require('joi');
const fp = require('lodash/fp');

 
const randomDate = function(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

exports.seed = function (knex) {



  const table_name = 'commissions';
  const schema = require('../models/Commissions').joiSchema;

  let rows = []; 
 
  for(var i = 0; i  < 100; i ++){ 
    var _date = randomDate(new Date(2020, 0, 1), new Date());
    var _amount = (Math.random() * 1000) + 100;
    var random_user_id = Math.ceil( (Math.random() * 4) + 1);

    rows.push({id: i + 1,
      user_id: random_user_id,  
      amount: _amount, 
      created_at: _date 
     }); 
  }
 
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
