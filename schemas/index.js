'use strict';

const Joi = require('joi');

const DataField = {
  data_type: Joi.string().required().valid(['string', 'number', 'date']),
  key: Joi.string().required(),
  display_name: Joi.string().required().allow(['', null])
};

module.exports = { DataField };
