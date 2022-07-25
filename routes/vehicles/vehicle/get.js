'use strict';

const Joi = require('joi');

module.exports = {
  method: 'POST',
  path: '/vehicles',
  options: {
    tags: ['api'],
    validate: { 
    },
    handler: async (request) => {
      try {
        const { vehicleService } = request.services();
        const { payload } = request;

        let filter = payload.filter || {}  ;
 

        if(payload.state){
            filter = { state: payload.state,  ...filter}; 
        }

         
        if(payload.vehicleType){
          filter = { vehicleType: payload.vehicleType,  ...filter}; 
        }
  
        const vehicles = await vehicleService.getVehicles(filter);

        return vehicles;
      }
      catch (error) {
        return error;
      }
    }
  }
};
