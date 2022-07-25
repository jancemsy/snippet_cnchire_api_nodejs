'use strict';

const UserModel = require('../../../models/User');
const Joi = require('joi');
//const Bcrypt = require('bcrypt');
const Bcrypt = require('bcryptjs');
const fp = require('lodash/fp');

const SALTROUNDS = 2;
const composeNewUser = (user = {}) => {

  const password = fp.get('password', user);

  if (fp.isNil(password)) {
    return user;
  }

  const hasher = require('wordpress-hash-node');
  const hashedPw = hasher.HashPassword(password); 
  ///const hashedPw = Bcrypt.hashSync(password.toString(), SALTROUNDS);
  
  return {
    ...user,
    password: hashedPw
  };
};

const filterFieldsForUpdate = (user = {}) => {
  const immutableFields = ['id', 'created_at'];
  return fp.omit(immutableFields, user);
};

const toUserFormat =
  fp.flow(
    fp.reduce((users, user) => {

      const UserModelFields = fp.keys(
        Joi.describe(UserModel.joiSchema).children
      );

      const {
        user_role: role,
        user_level : level,
        client: name,
        client_key,
        client_id,
        description
      } = user;

      return {
        ...users,
        [user.id]: {
          ...fp.pick(UserModelFields, user),
          user_roles: [
            ...fp.getOr([], `${user.id}.user_roles`, users),
            {
              client_id,
              client_key,
              role,
              level
            }
          ],
          clients: [
            ...fp.getOr([], `${user.id}.clients`, users),
            {
              client_id,
              client_key,
              name,
              description
            }
          ]
        }
      };
    }, {}),
    fp.values
  );

module.exports = { composeNewUser, filterFieldsForUpdate, toUserFormat };
