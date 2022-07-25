'use strict';

const Schwifty = require('schwifty');
const Joi = require('joi');

module.exports = class Vehicles extends Schwifty.Model {
  static get tableName() {
    return 'vehicles';
  }

  static get joiSchema() {
    return Joi.object({
      id: Joi.number().integer().optional(),
      user_id: Joi.number().integer().optional(),
      vehicle_name: Joi.string().required(),
      description: Joi.string().required(),
      vehicle_type: Joi.string().required(),

      hire_type_1           : Joi.bool(),
      hire_type_2           : Joi.bool(),
      hire_type_3           : Joi.bool(),

      slug: Joi.string(),
      lat: Joi.string(),
      lng: Joi.string(),
      hire_type: Joi.string().allow(''),

      state: Joi.string().required(),
      state_code: Joi.string().required(),
      location: Joi.string().required(),
      number_of_travellers: Joi.number().required(), 
      price_per_day: Joi.number().required(),
      security_bond :  Joi.number().required(),

      images : Joi.string(),  
      thumbnail: Joi.string(),


      amenities : Joi.string(),
      addon_amenities : Joi.string(),  
      rate_rules : Joi.string(),

      condition_min_driver_age           : Joi.number(),
      condition_permitted_road_types     : Joi.string(), 
      condition_river_crossing           : Joi.bool(),
      condition_beach_access             : Joi.bool(),
      condition_outback_roads            : Joi.bool(),
      condition_specific_terms           : Joi.string().allow(''),
      suburb: Joi.string().allow(''),
      
      vehicle_make              : Joi.string().required(), 
      vehicle_model             : Joi.string().required(),
      vehicle_year_manufactured : Joi.number().required(),
      score                     : Joi.number().default(0),
      vehicle_sleeps            : Joi.number().allow(null),
      vehicle_length            : Joi.string().required(), 
      vehicle_width             : Joi.string().required(), 
      vehicle_family_friendly   : Joi.bool(),
      vehicle_pet_friendly      :Joi.bool(),
      
      thumbnail: Joi.string().allow(''),
      towing_tare: Joi.string().allow(''),
      towing_atm: Joi.string().allow(''),
      towing_towball_weight: Joi.string().allow(''),
      towing_plug: Joi.string().allow(''), 

      locked_from           : Joi.string().allow(''),
      locked_to             : Joi.string().allow(''),

      is_active: Joi.any().default(true),
      is_approved: Joi.bool().default(false),
      is_deleted: Joi.bool().default(false), 
      //is_approved: Joi.any(), 

      created_at: Joi.date(), //.default(() => new Date(), 'current date'),
      updated_at: Joi.date(),  //.default(() => new Date(), 'current date')
      
      minimum_hire_duration : Joi.any(), 
      maximum_hire_duration : Joi.any(), 

      unavailability : Joi.any(), 
      status : Joi.any().default('pending'), 
    });
  }
};
