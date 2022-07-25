'use strict';

const fp = require('lodash/fp');
const Joi = require('joi');
const VehicleModel = require('../../../models/Vehicles');
const Boom = require('boom');

module.exports = {
  method: 'PUT',
  path: '/vehicles/{id}',
  options: {
    tags: ['api'],
    validate: {
      params: {
        id: Joi.number().integer().min(1).required()
      },
      payload: VehicleModel
        .joiSchema
        .optionalKeys('description', 'vehicle_name', 'vehicle_type', 'hire_type', 'state',
          'state_code', 'location', 'number_of_travellers', 'vehicle_year_manufactured', 'price_per_day'),
      failAction: (request, h, error) => Boom.boomify(error)
    },
    handler: async (request) => {
      try {
        const { vehicleService } = request.services();
        const { payload, params } = request;

        const id = fp.get('id', params);
        const vehicleDetails = await vehicleService.updateVehicleDetails(id, payload);

        return vehicleDetails;
      }
      catch (error) {
        return error;
      }
    }
  }
};
