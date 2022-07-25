'use strict';

const Joi = require('joi');
const fp = require('lodash/fp');
const { composeNewUser } = require('../services/utils/user-helper');

exports.seed = async function (knex) {

  const table_name = 'users';
  const schema = require('../models/User').joiSchema;

  const rows = [
    {
      id: 1,
      first_name: 'James',
      last_name: 'Martinez',
      middle_name: 'A',
      address: '82 Henry Street, Kennett River, Victoria',
      contact_number: '5331 1546',
      is_owner: false,
      is_hirer: false,
      dob: '1984-10-03',
      email: 'admin@gmail.com',
      username: 'jancemsy',
      password: '12345',
      user_role: 'Admin',
      stripe_customer_id: '',
      is_active: true,
      is_deleted: false,
      created_at: '2019-05-03 09:09:09',
      updated_at: '2019-05-03 09:09:10'
    },
    {
      id: 2,
      first_name: 'John',
      last_name: 'Doe',
      middle_name: 'A',
      address: '75 Lowe Street, Baking Board, Queensland',
      contact_number: '4543 6304',
      is_owner: true,
      is_hirer: false,
      dob: '1984-10-03', 
      email: 'james-owner@gmail.com',
      password: '12345',
      user_role: 'Owner',
      stripe_customer_id: '',
      is_active: true,
      is_deleted: false,
      created_at: '2019-05-03 09:09:09',
      updated_at: '2019-05-03 09:09:10'
    },
    {
      id: 3,
      first_name: 'Sarah',
      last_name: 'East',
      middle_name: 'A',
      address: '77 Yangan Drive, Blackville, New South Wales',
      contact_number: '6781 6575',
      is_owner: false,
      is_hirer: true,
      dob: '1984-10-03', 
      email: 'james-customer@gmail.com',
      password: '12345',
      user_role: 'Hirer',
      stripe_customer_id: '',
      is_active: true,
      is_deleted: false,
      created_at: '2019-05-03 09:09:09',
      updated_at: '2019-05-03 09:09:10'
    },
    {
      id: 4,
      first_name: 'Tristan',
      last_name: 'Bishop',
      middle_name: 'C',
      address: '142  Shirley Street, Pimpana, Queensland',
      contact_number: '3500 7859',
      is_owner: true,
      is_hirer: false,
      dob: '1984-10-03', 
      email: 'tristan@owner.com',
      password: '12345',
      user_role: 'Owner',
      stripe_customer_id: '',
      is_active: true,
      is_deleted: false,
      created_at: '2019-05-03 09:09:09',
      updated_at: '2019-05-03 09:09:10'
    },
      {
      id: 5,
      first_name: 'Jessica',
      last_name: 'Mer',
      middle_name: 'A',
      address: '75 Lowe Street, Baking Board, Queensland',
      contact_number: '4543 6304',
      is_owner: false,
      is_hirer: true,
      dob: '1984-10-03', 
      dob: '1984-10-03',
      email: 'customer@gmail.com',
      password: '12345',
      user_role: 'Hirer',
      stripe_customer_id: 'cus_J3EFZwMQcU71O8',
      is_active: true,
      is_deleted: false,
      created_at: '2019-05-03 09:09:09',
      updated_at: '2019-05-03 09:09:10'
    },
    {
      id: 6,
      first_name: 'James',
      last_name: 'Smith',
      middle_name: 'A',
      address: '75 Lowe Street, Baking Board, Queensland',
      contact_number: '4543 6304',
      is_owner: true,
      is_hirer: false,
      dob: '1984-10-03', 
      email: 'owner@gmail.com',
      password: '12345',
      user_role: 'Owner',
      stripe_customer_id: '',
      is_active: true,
      is_deleted: false,
      created_at: '2019-05-03 09:09:09',
      updated_at: '2019-05-03 09:09:10'
    },

    {
      id: 7,
      first_name: 'Nino',
      last_name: 'muhlach',
      middle_name: 'A',
      address: '75 Lowe Street, Baking Board, Queensland',
      contact_number: '4543 6304',
      is_owner: false,
      is_hirer: true,
      dob: '1984-10-03', 
      email: 'testingonly260@gmail.com',
      password: '12345',
      user_role: 'Hirer',
      stripe_customer_id: '',
      is_active: true,
      is_deleted: false,
      created_at: '2019-05-03 09:09:09',
      updated_at: '2019-05-03 09:09:10'
    },

    {
      id: 8,
      first_name: 'John',
      last_name: 'Meyer',
      middle_name: 'A',
      address: '75 Lowe Street, Baking Board, Queensland',
      contact_number: '4543 6304',
      is_owner: true,
      is_hirer: false,
      dob: '1984-10-03', 
      email: 'james-owner2@gmail.com',
      password: '12345',
      user_role: 'Owner',
      stripe_customer_id: '',
      is_active: true,
      is_deleted: false,
      created_at: '2019-05-03 09:09:09',
      updated_at: '2019-05-03 09:09:10'
    },
  ];

  
  /*
  we do not need this for now and it causes issues with  
  -  cannot truncate a table referenced in a foreign key constraint

  await knex.raw(`TRUNCATE TABLE vehicle_towing_details`);
  await knex.raw(`TRUNCATE TABLE vehicle_price`);
  await knex.raw(`TRUNCATE TABLE vehicle_details`);
  await knex.raw(`TRUNCATE TABLE vehicle_conditions_of_use`); 
  await knex.raw(`TRUNCATE TABLE vehicle_additional_amenities`);
  await knex.raw(`TRUNCATE TABLE vehicles`);
  await knex.raw(`TRUNCATE TABLE users`); 
  */
  
  return knex(table_name)
  .then(async () => {
    try {
      const composedUsers = rows.map((row) => {
        const composedUser = composeNewUser(row);
        const user = Joi.validate(composedUser, schema);
        const error = fp.get('error', user);

        if (!fp.isEmpty(error)) {
          throw error;
        }

        return user.value;
      });

      const insertedUsers = await knex(table_name).insert(composedUsers); 
      try{ //postgres indexing  fix. try catch because this doesnt work for mysql 
        await knex.raw("alter sequence 	" + table_name + "_id_seq restart with "+ (rows.length  + 1) +"; ") ;   
      }catch(e){ 
      }
      return insertedUsers; 
    }
    catch (error) {
      if (error.message.indexOf('violates unique constraint "users_pkey"') > -1){
        return console.log('SEED ALREADY EXISTS');
      }

      throw error;
    }
  });
};
