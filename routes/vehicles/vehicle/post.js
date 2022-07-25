'use strict';

const VehiclesModel = require('../../../models/Vehicles');
const Boom = require('boom');

module.exports = {
  method: 'POST',
  path: '/vehicles/create',
  options: {
    tags: ['api'],
    validate: {
      payload: VehiclesModel
        .joiSchema,
      failAction: (request, h, error) =>
        Boom.boomify(error)
    },
    handler: async (request) => {
      try {
        const { vehicleService } = request.services();
        const { payload } = request;

        const vehicle = await vehicleService.createVehicle(payload);
        return vehicle;
      }
      catch (error) {
        return error;
      }
    }
  }
};

