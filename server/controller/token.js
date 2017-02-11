 var crypto = require('crypto'); //加载crypto库
 var settings = require('../conf/api'); //私钥配置

 //api Token生成
 var create = (time) => {
   //sha1(base64(timestamp)+saltKey);
   var sha1 = crypto.createHash('sha1');
   var content = time.toString();
   content = (new Buffer(content)).toString('base64');
   sha1.update(content);
   sha1.update(settings.saltKey);
   var token = sha1.digest('hex');
   return {
     time,
     token
   };
 };

 var valid = (param) => {
   var timeInterval = Date.now() - param.time;
   if (timeInterval / 60000 > settings.expired) {
     return {
       status: settings.status.TIME_RELEASED,
       info: 'Error,Time released.',
       timeInterval
     };
   }

   var tokenStr = {};
   var expToken = create(param.time);
   if (param.token == expToken.token) {
     tokenStr = {
       status: settings.status.COMPLETE
     };
   } else {
     tokenStr = {
       status: settings.status.INVALID_KEY,
       info: 'Invalid api token'
     };
   }

   return tokenStr;
 };

 module.exports = {
   create,
   valid
 };
