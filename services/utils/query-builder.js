'use strict';

const fp = require('lodash/fp');

const operatorMap = {
  gte: '>=',
  lte: '<=',
  in: 'in',
  like: 'like'
};

module.exports = (query, filterParams) =>
  fp.flow(
    fp.toPairs,
    fp.reduce((chainedQuery, [key, operations]) => {
      if (!fp.isObject(operations) && !fp.has(operations, operatorMap)) {
        return chainedQuery.where(key, operations);
      }

      fp.flow(
        fp.toPairs,
        fp.forEach(([operand, value]) => {
          if (operand.toLowerCase() === 'in') {
            return chainedQuery.whereIn(key, value);
          }

          if (operand.toLowerCase() === 'like') {
            return chainedQuery.where(key, 'like', `%${value}%`);
          }

          return chainedQuery.where(key, operatorMap[operand], value);
        })
      )(operations);

      console.log('aa', chainedQuery);
      return chainedQuery;
    }, query)
  )(filterParams)
;
