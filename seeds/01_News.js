'use strict';

const Joi = require('joi');
const fp = require('lodash/fp');

exports.seed = function (knex) {

  const table_name = 'news';
  const schema = require('../models/News').joiSchema;

  const rows = [
    {
      id: 1,
      title: 'Great Caravan and great people to deal with!',
      content: 'Great caravan and great people to deal with. Was clean and tidy. The Expanda had a really flexible layout, a shower / toilet, and allowed us with small children to have privacy when we needed it, safe playing areas and visitors. The owners delivered and setup, and packed down and picked up, which really took the stress away from Towing. Thanks again.',
      image_path: 'https://cnchire.com.au/wp-content/uploads/2019/02/IMG_3276.jpg'
    },
    {
      id: 2,
      title: 'The Van was great!',
      content: 'The van was great! Exactly how Zeb had described with everything we needed. The owner was more than accommodating great guy who takes great care of his van and his renters!',
      image_path: 'https://cnchire.com.au/wp-content/uploads/2019/02/42-76DD6ADD-6268-4D72-AEE0-54879CF6D055-500x374.jpeg'
    },
    {
      id: 3,
      title: 'We had a lovely time away and would highly recommend',
      content: 'What a great van! We had a lovely time away and would highly recommend it to others.',
      image_path: 'https://cnchire.com.au/wp-content/uploads/2018/11/Basestation-7-500x374.jpg'
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