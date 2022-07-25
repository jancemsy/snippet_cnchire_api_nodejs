'use strict';

const Joi = require('joi');
const fp = require('lodash/fp');

exports.seed = function (knex) {

  const table_name = 'amenities';
  const schema = require('../models/Amenities').joiSchema;

  const rows = [


{id: 1, amenity: 'Awning'},
{id: 2, amenity: 'Basic pantry'},
{id: 3, amenity: 'Fridge'},
{id: 4, amenity: 'Gas bottle'},
{id: 5, amenity: 'Microwave'},
{id: 6, amenity: 'Shower & toilet'},
{id: 7, amenity: 'Air conditioner'},
{id: 8, amenity: 'Annex'},
{id: 9, amenity: 'Bbq'},
{id: 10, amenity: 'Bike rack'},
{id: 11, amenity: 'Camping table and chairs'},
{id: 12, amenity: 'Coffee and tea'},
{id: 13, amenity: 'Coffee machine'},
{id: 14, amenity: 'Cutlery and plates'},
{id: 15, amenity: 'Dishwasher'},
{id: 16, amenity: 'Freezer'},
{id: 17, amenity: 'Heating'},
{id: 18, amenity: 'Outdoor kitchen'},
{id: 19, amenity: 'Reversing camera'},
{id: 20, amenity: 'Satellite tv'},
{id: 21, amenity: 'Solar panels'},
{id: 22, amenity: 'Stereo'},
{id: 23, amenity: 'Tv'},
{id: 24, amenity: 'Wheelchair access'},
{id: 25, amenity: 'WIFI Access'},  
{id: 26, amenity: 'On Site Setup'},
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