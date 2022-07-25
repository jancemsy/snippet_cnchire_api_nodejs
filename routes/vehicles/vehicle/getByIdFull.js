'use strict';

const fp = require('lodash/fp');
const Joi = require('joi');

module.exports = {
  method: 'GET',
  path: '/vehicles/full/{id}',
  options: {
    tags: ['api'],
    validate: {
      params: {
        id: Joi.number().integer().min(1).required()
      }
    },
    handler: async (request) => {
      try {
        const id = fp.get('params.id', request);
        const { vehicleService } = request.services(); 
        const vehicleDetails = await vehicleService.findByIdFull(id); 
        return vehicleDetails;
      }
      catch (error) {
        return error;
      }
    }
  }
};
