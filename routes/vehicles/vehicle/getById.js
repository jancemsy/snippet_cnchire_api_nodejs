'use strict';

const fp = require('lodash/fp');
const Joi = require('joi');

module.exports = {
  method: 'GET',
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
        const id = fp.get('params.id', request);
        const { vehicleService,searchService  } = request.services(); 
        const vehicleDetails = await vehicleService.findById(id); 

 
 
        if(vehicleDetails.success){ 
          searchService.countVehicle({
              vehicle_id : id, 
              user_id: vehicleDetails.data.vehicle.userId 
          });  
       } 


        return vehicleDetails;
      }
      catch (error) {
        return error;
      }
    }
  }
};
