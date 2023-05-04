import moment from 'moment';

export const isTRArray = function (attr) {
  return Object.prototype.toString.call(attr) === '[object Array]';
};

export const isTRString = function (attr) {
  return Object.prototype.toString.call(attr) === '[object String]';
};

export const isTRObject = function (attr) {
  return Object.prototype.toString.call(attr) === '[object Object]';
};

export const isTRNumber = function (attr) {
  return Object.prototype.toString.call(attr) === '[object Number]';
};

export const isTRFloat = function (attr) {
  return Object.prototype.toString.call(attr) === '[object Number]' && parseFloat(attr) === attr;
};

export const isTRDate = function (attr) {
  return Object.prototype.toString.call(attr) === '[object Number]' && moment(attr).isValid();
};
