'use strict';

const Schwifty = require('schwifty');
const Joi = require('joi');

module.exports = class VehiclePrice extends Schwifty.Model {
  static get tableName() {
    return 'vehicle_price';
  }

  static get joiSchema() {
    return Joi.object({
      id: Joi.number().integer().optional(),
      vehicle_id: Joi.number().integer().required(),
      price: Joi.number().integer().required(),
      date: Joi.date().required(),
      is_active: Joi.bool().default(true),
      is_deleted: Joi.bool().default(false),
      created_at: Joi.date().default(() => new Date(), 'current date'),
      updated_at: Joi.date().default(() => new Date(), 'current date')
    });
  }
};
