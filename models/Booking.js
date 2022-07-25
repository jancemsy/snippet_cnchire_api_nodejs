'use strict';

const Schwifty = require('schwifty');
const Joi = require('joi');

module.exports = class Booking extends Schwifty.Model {
  static get tableName() {
    return 'bookings';  
  }

  static get joiSchema() {
    return Joi.object({
      id: Joi.number().integer().optional(),

      uuid: Joi.string(), 

      hirer_id: Joi.number().integer(),  
      owner_id: Joi.number().integer() ,  
      payment_type: Joi.string().allow(null).allow('') , //partial or full
      addons: Joi.any(), 
      vehicle_id: Joi.number().integer(),
      start_date: Joi.date(), 
      end_date: Joi.date(),  
       
      total_number_of_stay: Joi.number(),
      total_guest: Joi.number(),  
      no_adult_travellers: Joi.number(),  
      total_addons_amount : Joi.number(),   
      total_amount : Joi.number(),    
      bond_amount: Joi.number(),  
      bond_claim_amount: Joi.number(),  
      total_applied_rate : Joi.number(), 
      rate_breakdown : Joi.string().allow(null).allow(''),
      version : Joi.number(),
      
      service_fee :  Joi.number().allow(null).allow(0),    //this used redundantly from migration 
      booking_fee :  Joi.number(),   

      driver_name:  Joi.string().allow(null).allow(''),
      driver_dob:  Joi.string().allow(null).allow(''),

 
      messaging : Joi.string().allow(null).allow(''),
      planned_destination_state : Joi.string().allow(null).allow(''),

      



      //converted to string to prevent conflict with null and migration 
      date_approved:  Joi.string().allow(null).allow(''),
      date_completed: Joi.string().allow(null).allow(''),
      date_rejected: Joi.string().allow(null).allow(''),
      date_forfeited: Joi.string().allow(null).allow(''),
      full_payment_due: Joi.string().allow(null).allow(''),
      initial_payment_due: Joi.string().allow(null).allow(''),
      final_payment_due: Joi.string().allow(null).allow(''),
      full_payment_paid: Joi.string().allow(null).allow(''),
      initial_payment_paid: Joi.string().allow(null).allow(''),
      final_payment_paid: Joi.string().allow(null).allow(''),
      last_notification: Joi.string().allow(null).allow(''),
	  
      

      wp_backup: Joi.string().allow(null).allow(''),
      total_balance:  Joi.number(),  
      date_requested: Joi.date(), 
      full_amount_due:  Joi.number(),      
      initial_amount_due:  Joi.number(), 
      final_amount_due:  Joi.number(),
      step: Joi.number().integer() ,  
      is_free_camping : Joi.number().integer().default(1) ,  
	    is_refunded: Joi.number().integer() ,  
      is_nopayment_data: Joi.number().integer().default(0) ,  
      status: Joi.string().allow(null).allow(''),


      contract:  Joi.string().allow(null).allow(''),
      created_at: Joi.date(), 


      children_travelers : Joi.number().default(0),
      planned_destinations : Joi.string().default(null).allow(''),
      towing_vehicle_make : Joi.string().default(null).allow(''),

      vehicle_model : Joi.string().default(null).allow(''),
      vehicle_year : Joi.string().default(null).allow(''),
      towing_capacity : Joi.string().default(null).allow(''),
      towing_vehicle_tow_bar  : Joi.string().default(null).allow(''),
      towing_experience : Joi.string().default(null).allow(''),
      electronic_brakes : Joi.string().default(null).allow(''),

      additional_extra: Joi.string().default(null).allow(null).allow(''),
      additional_notes: Joi.string().default(null).allow(null).allow(''), 
      booking_cost : Joi.number().allow(null).allow(''),
      total_earnings: Joi.number().allow(null).allow(''),
      commission: Joi.number().allow(null).allow(''),
      total_commission: Joi.number().allow(null).allow(''),
      tax_amount: Joi.number().allow(null).allow(''),
      card_id : Joi.string().allow(null).allow(''),
      insurance_fee: Joi.number().allow(null).allow(''),
      is_payout_transfered :  Joi.number().allow(null).allow(''),
      upcoming_payment    :  Joi.string().allow(null).allow(''),



      /*
      NOTE: Setting up default values here for some reason produce
      conflicts with our sql update script. definitely a bug from this framework. 

      total_balance:  Joi.number().default(0),  
      date_requested: Joi.date().default(() => new Date(), 'current date'), 
      full_amount_due:  Joi.number().default(0),      
      initial_amount_due:  Joi.number().default(0), 
      final_amount_due:  Joi.number().default(0),
      step: Joi.number().integer().default(1) ,  
      status: Joi.string().default('pending-approval')        
      */

    });
  }
};
