var express = require('express');
var router = express.Router();
var handleAuthCheck = require('../common').handleAuthCheck;
var assertsDir = require('../conf/app').assertsDir;

/* GET home page. */
router.get('/', function(req, res, next) {
  handleAuthCheck(req, res, assertsDir + '/index.html');
});

module.exports = router;
