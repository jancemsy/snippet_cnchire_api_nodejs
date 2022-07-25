'use strict';

const { camelCase } = require('lodash');

const collection = function(list, transformer = null, resource = 'data') {
  const results = list.reduce((parsed, row) => {
    parsed.push(item(row, transformer).data);
    return parsed;
  }, []);

  return { [resource]: results };
}

const item = function(data, transformer, resource = 'data') {
  if (transformer !== null && typeof transformer.transform === 'function') {
    data = transformer.transform(data);
  } else {
    data = Object.keys(data).reduce((map, key) => {
      map[camelCase(key)] = data[key];
      return map;
    }, {});
  }

  return { [resource]: data };
}

const pagination = function(data, transformer, resource = 'data') {
  const { results, total } = data;
  return {
    [resource]: collection(results, transformer).data,
    meta: { total }
  }
}

module.exports = { collection, item, pagination };
