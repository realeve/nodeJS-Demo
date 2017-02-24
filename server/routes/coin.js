var express = require('express');
var router = express.Router();
var assertsDir = require('../conf/app').assertsDir;
var coin = require('../controller/coin');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(process.cwd() + assertsDir + '/coin.html');
});

router.get('/static/date/:id', function(req, res, next) {
  var id = Number.parseInt(req.params.id, 10);
  coin.static.date(req, res, id);
});

router.get('/static/popular/:id', function(req, res, next) {
  var id = Number.parseInt(req.params.id, 10);
  coin.static.popular(req, res, id);
});

router.get('/static/theme', function(req, res, next) {
  coin.static.theme(req, res, next);
});

router.get('/static/province', function(req, res, next) {
  coin.static.province(req, res, next);
});

router.get('/static/goods/:id', function(req, res, next) {
  coin.static.goodsId(req, res, next);
});

router.get('/crawler/detail', function(req, res, next) {
  coin.crawler.crawlerDetail(req, res, next);
});

router.get('/crawler/record/:id', function(req, res, next) {
  coin.crawler.crawlerTradeRecordById(req, res, next);
});

router.get('/crawler/record/all', function(req, res, next) {
  coin.crawler.crawlerTradeRecord(req, res, next);
});

router.get('/all', function(req, res, next) {
  coin.all(req, res, next);
});

//商品信息
router.get('/goods/:id', function(req, res, next) {
  coin.chinaGold.goods(req, res, next);
});

//商品属性
router.get('/detail/:id', function(req, res, next) {
  coin.chinaGold.detail(req, res, next);
});

//商品价格
router.get('/price/:id', function(req, res, next) {
  coin.chinaGold.product(req, res, next);
});

//订单交易记录
router.get('/order/:id', function(req, res, next) {
  coin.chinaGold.order(req, res, next);
});

module.exports = router;
