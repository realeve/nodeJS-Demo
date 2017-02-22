var express = require('express');
var router = express.Router();
var assertsDir = require('../conf/app').assertsDir;
var coin = require('../controller/coin');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.sendFile(process.cwd() + assertsDir + '/coin.html');
});

router.get('crawler', function(req, res, next) {
	coin.crawler(req, res, next);
});

router.get('/all', function(req, res, next) {
	coin.all(req, res, next);
});

//商品信息
router.get('/goods/:id', function(req, res, next) {
	coin.goods(req, res, next);
});

//商品属性
router.get('/detail/:id', function(req, res, next) {
	coin.detail(req, res, next);
});

//商品价格
router.get('/price/:id', function(req, res, next) {
	coin.product(req, res, next);
});

//订单交易记录
router.get('/order/:id', function(req, res, next) {
	coin.order(req, res, next);
});

module.exports = router;