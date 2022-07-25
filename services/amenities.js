'use strict';

const Schmervice = require('schmervice');
const composeResponse  = require('./utils/compose-response');
const queryBuilder = require('./utils/query-builder');
const fp = require('lodash/fp');
const Boom = require('boom');

module.exports = class AmenitiesService extends Schmervice.Service {


  async get(filters = {}) { 
    const { Amenities } = this.server.models(); 
    const query = await Amenities.query(); 
    return composeResponse.create(query);

  } 
};
