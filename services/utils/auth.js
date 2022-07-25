'use strict';

const fp = require('lodash/fp');

const isAdmin = fp.flow(
  fp.get('userRoles'),
  fp.some((role) => role.level > 1)
);

const isOwner = fp.flow(
  fp.get('userRoles'),
  fp.some((role) => role.role === 'Owner'  && role.level > 1)
);

const isSuperAdmin = fp.flow(
  fp.get('userRoles'),
  fp.some((role) => role.level === 5)
);


const getUserRole = (user = {}, orgId) => {
  const roles = fp.getOr([], 'userRoles')(user);

  if (isSuperAdmin(user)) {
    return fp.flow(
      fp.filter({ level: 5 }),
      fp.head
    )(roles);
  }

  const userRole = fp.flow(
    fp.filter({ clientId : orgId }),
    fp.head
  )(roles);

  return !fp.isEmpty(userRole) ? userRole : {};
};

module.exports = {
  isAdmin,
  isOwner,
  getUserRole
};
