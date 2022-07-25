'use strict';

const Joi = require('joi');
const fp = require('lodash/fp');

exports.seed = function (knex) {

  const table_name = 'faqs';
  const schema = require('../models/Faqs').joiSchema;

  const rows = [
    {
      id: 1,
      faq_question: 'What details are required for profile setup',
      faq_answer: 'Setting up your CnC Hire Owner/Partner Profile is quick and easy, allowing you to immediately list your own vehicle to hire out so that people can search and find your RV for their next holiday!',
      category: 'Account & Profile',
      is_deleted: false
    },
    {
      id: 2,
      faq_question: 'Managing your profile',
      faq_answer: 'Want to change your phone number, location, email address or update your listing photos and text? Easy!!',
      category: 'For Hirers/Travellers',
      is_deleted: false
    },
    {
      id: 3,
      faq_question: 'Cancellation Ts & Cs',
      faq_answer: 'Changes & Cancellation Policy regarding Bond Refunds: To be eligible for a part deposit/bond refund, all changes & cancellations to bookings must to be made directly via email to Caravan and Camping Hire 8 weeks prior to the Hire booking commencement date.',
      category: 'Cancellation Terms and Conditions',
      is_deleted: false
    },
    {
      id: 4,
      faq_question: 'How do I list my RV for Hire',
      faq_answer: 'Create your free account/profile by signing up on our website. Either click the “Sign Up” or “List My Vehicle” options from the main menu.',
      category: 'For Owners',
      is_deleted: false
    },
    {
      id: 5,
      faq_question: 'Insurance Cover Details',
      faq_answer: 'WE USE AUS INSURANCE SERVICES (AIS) who have custom Hire Cover Packages for CnCHire Owners and also have optional 24/7 Roadside assist as well',
      category: 'Insurance Cover Details',
      is_deleted: false
    },
    {
      id: 6,
      faq_question: 'Portable Electric Brake Unit Hire',
      faq_answer: 'We also sell/hire out our own custom designed Tekonsha Primus Portable Electric Brake Units so that every single caravan/camper that is hired out is towed legally.',
      category: 'Portable Electric Brake Unit Hire',
      is_deleted: false
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