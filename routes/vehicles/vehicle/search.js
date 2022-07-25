'use strict';

const Joi = require('joi');

module.exports = {
  method: 'POST',
  path: '/vehicles/search',
  options: {
    tags: ['api'],
    validate: {  
    },
    handler: async (request) => {
      try {
        const { vehicleService,  searchService } = request.services();
        const { payload } = request; 
        const vehicles = await vehicleService.searchVehicles(payload);  

        if(payload.location ){
           searchService.countLocation(payload.location); 
        }

        return vehicles;
      }
      catch (error) {
        return error;
      }
    }
  }
};
