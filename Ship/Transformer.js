'use strict';

const {
  camelCase,
  get, 
  isEmpty,
  isNil, 
  set, 
  split
} = require('lodash');

module.exports = class Transformer {
  _availableAttrs = ['id', 'first_name:firstName'];
  _excludeEmpty = true;

  transform(data) {
    return this._availableAttrs.reduce((transformed, attr) => {
      const [ key, convertKey ] = split(attr, ':', 2);
      const newKey = isNil(convertKey) ? camelCase(key) : convertKey;
      const value = get(data, key, null);

      if (!this._excludeEmpty || !isEmpty(value + '')) {
        set(transformed, newKey, value);
      }

      return transformed;
    }, {});
  }
}
