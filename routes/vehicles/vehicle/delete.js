'use strict';

const fp = require('lodash/fp');
const Joi = require('joi');

module.exports = {
  method: 'DELETE',
  path: '/vehicles/{id}',
  options: {
    tags: ['api'],
    validate: {
      params: {
        id: Joi.number().integer().min(1).required()
      }
    },
    handler: async (request) => {
      try {
        const { vehicleService } = request.services();
        const id = fp.get('params.id', request);
        const deletedVehicle = await vehicleService.softDelete(id);

        return deletedVehicle;
      }
      catch (error) {
        return error;
      }
    }
  }
};
