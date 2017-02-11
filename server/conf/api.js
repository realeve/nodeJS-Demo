var saltKey = 'MIICXQIBAAKBgQCoWUIOtZAA4EB';

var expired = 5; //过期时间：120分钟

var needValid = true;
var status = {
  COMPLETE: 200,
  INVALID_KEY: 401,
  TIME_RELEASED: 400,
  NOT_FOUND_ERROR: 404
};
module.exports = {
  saltKey,
  expired,
  needValid,
  status
};
