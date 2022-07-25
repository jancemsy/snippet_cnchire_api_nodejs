'use strict';

const fp = require('lodash/fp'); 

const Joi = require('joi');

module.exports = {
  method: 'GET',
  path: '/vehicles/get_exclude_dates/{id}',
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
        return await vehicleService.get_exclude_dates(id); 
      }
      catch (error) {
        return error;
      }
    }
  }
};
