'use strict';

const Schwifty = require('schwifty');
const Joi = require('joi');

module.exports = class Amenities extends Schwifty.Model {
  static get tableName() {
    return 'amenities';
  }

  static get joiSchema() {
    return Joi.object({
      id: Joi.number().integer().optional(), 
      amenity: Joi.string().required(),
      field: Joi.string(),
      is_active: Joi.bool().default(true),
      is_deleted: Joi.bool().default(false),
      created_at: Joi.date().default(() => new Date(), 'current date'),
      updated_at: Joi.date().default(() => new Date(), 'current date')
    });
  }
};
