var conf = require('../conf/db');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://' + conf.mongodb.host + ':' + conf.mongodb.port + '/' + conf.mongodb.database;
var db;

MongoClient.connect(url, (err, database) => {
  if (err) throw err;
  db = database;
});

var static = require('./coinStatic');
var chinaGold = require('./coin-chinagoldcoin');
var crawler = require('./coinCrawler');

function allProduct(req, res, next) {
  var col = db.collection('goods');
  var pipeline = col.find({}, {
    "msg.goodsName": "name",
    "msg.shopPrice": 1,
    "count": 1,
    "detail.attr.year": 1,
    "detail.attr.material": 1,
    "detail.attr.theme": 1,
    "detail.img": 1,
    _id: 0
  });

  pipeline = pipeline.sort({
    goodsId: -1
  });

  pipeline.toArray(function(err, result) {
    var product = [];
    product = result.map(function(item) {
      return {
        name: item.msg.goodsName,
        price: Number.parseFloat(item.msg.shopPrice),
        count: item.count,
        sales: item.count * Number.parseFloat(item.msg.shopPrice),
        year: item.detail.attr.year,
        material: item.detail.material,
        theme: item.detail.attr.theme,
        img: item.detail.img[0]
      };
    });
    res.json(product);
  });
}

module.exports = {
  chinaGold,
  crawler,
  static,
  all: allProduct
};