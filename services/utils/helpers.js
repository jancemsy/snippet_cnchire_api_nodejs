'use strict';
  
const moment = require('moment');    
const fp = require('lodash/fp'); 
const reduce = fp.reduce.convert({ cap: false });

exports.groupBy = groupKey =>
  reduce((obj, val, rawKey) => {
    const [key, fieldName] = rawKey.split('-').map(fp.trim);

    if (key !== groupKey) {
      return { ...obj, [rawKey]: val };
    }

    return fp.merge({ [key]: { [fieldName]: val } })(obj);
  }, {});

exports.normalizeEmptyGroup = fp.mapValues(val => (fp.isNil(val.id) ? {} : val));
exports.today = () =>{
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  
  today = yyyy + '-' + mm + '-' + dd ; 
  return today
}
exports.countDays  = (_from, _end) => { 
  var start = moment(_from);
  var end = moment(_end);
  return end.diff(start, "days") + 1; 
}