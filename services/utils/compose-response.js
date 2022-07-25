'use strict';

const fp = require('lodash/fp');
const deepMapKeys = require('deep-map-keys');
const { compose } = require('objection');
const moment = require('moment'); 

const dateToTimeStamp = dateObj => {
  if (!fp.isDate(dateObj)) {
    return dateObj;
  }

  return  moment(dateObj).format("YYYY-MM-DD"); ///dateObj.getTime();
};

//dateObj.toUTCString()
const dateToString = dateObj => (fp.isDate(dateObj) ?  moment(dateObj).format("YYYY-MM-DD")  : dateObj);

const sanitize = obj => {
  const timestampFields = ['start_time', 'end_time', 'start_date', 'end_date'];

  //

 const sanitizeObj = item => fp.entries(item).reduce((accu, [key, value]) => {

    if (!fp.includes(key)(timestampFields) && !fp.isNil(value)) {
      return { ...accu, [key]:dateToString(value) };
    }

    return { ...accu, [key]: dateToTimeStamp(value) };
  }, {});

  if (!fp.isArray(obj)){
    return sanitizeObj(obj);
  } 

  return fp.map(item => sanitizeObj(item), obj);
};

const removeNilFromObj = fp.flow(
  fp.toPairs,
  fp.reduce((accumulator, [key, value]) => {
    if (fp.isNil(value)) {
      return accumulator;
    }

    return fp.merge(accumulator, { [key] : value });
  }, {})
);

const composeResponse = (data = {},  pagingData = {}, success = true, error  = '' ) => {

  if(success === false ){
           return { success : false, message : error, data: {} };
  }else{    
          const total = fp.get('total', data);
          const meta = { total, ...pagingData };

          if (fp.get('is_deleted', data)) {
            const deleteMetaKey = fp.merge(meta, { acknowledged: true });
            return deepMapKeys(
              {success : success, data: sanitize(data), meta: removeNilFromObj(deleteMetaKey) },
              fp.camelCase
            );
          }

          if (!fp.isArray(data.results)) {
            return deepMapKeys({ success : success, data: sanitize(data), meta: removeNilFromObj(meta) }, fp.camelCase);
          }

          const respData = fp.get('results', data);
          return deepMapKeys({ success : success, data: sanitize(respData), meta }, fp.camelCase); 
  } 
};
 

exports.create = composeResponse;    
exports.error = (message) => { return { success : false, message : message, data: {} }; }; 
exports.success = (message) => { return { success : true, message : message, data: {} }; };
