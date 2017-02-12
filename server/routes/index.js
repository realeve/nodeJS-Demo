var express = require('express');
var router = express.Router();
var util = require('../common');
var assertsDir = require('../conf/app').assertsDir;

/* GET home page. */
router.get('/', function(req, res, next) {
  //使用index.html时忽略权限校验
  //将接口校验规则写至cookies用于全局数据读取
  util.setToken2Cookies(req,res,true);
  util.handleAuthCheck(req, res, assertsDir + '/home.html');
});

module.exports = router;
