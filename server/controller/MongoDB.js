var conf = require('../conf/db');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://' + conf.mongodb.host + ':' + conf.mongodb.port + '/' + conf.mongodb.database;

var isEmptyObject = require('../common').isEmptyObject;

var logger = require('winston');

var errorHandle = (err, param, operation) => {
  logger.error('Error occured.', {
    time: new Date().toLocaleString(),
    pid: process.pid,
    param: param,
    errInfo: err,
    operation: operation
  });
};

var db;

// Use connect method to connect to the server
// 引用mongoDB后即连接数据库，利用连接池控制连接的持续引用
MongoClient.connect(url, (err, database) => {
  if (err) {
    errorHandle(err, '连接数据库失败：' + url);
  }
  db = database;
});

var data2db = (req, res, data, operation) => {

  //选择collection/表
  var collection = db.collection(data.collection);
  switch (operation) {
    case 'find':
      var pipeline = collection[operation](data.where);

      //忽略skip条数据，用于分页
      if (data.skip) {
        pipeline = pipeline.skip(data.skip);
      }

      //数据条数限制，用于分页
      if (data.limit) {
        pipeline = pipeline.limit(data.limit);
      }

      //需要排序
      if (!isEmptyObject(data.sortby)) {
        pipeline = pipeline.sort(data.sortby);
      }

      //输出结果
      pipeline.toArray(function(err, result) {
        res.json(result);
      });
      break;
    case 'update':
      collection[operation](data.where, {
        $set: data.set
      }, {
        multi: true
      }, function(err, result) {
        res.json(result);
      });
      break;
    case 'aggregate':
      var option = [];
      //select idlist,count(*) as num from yourTable where ... group by ... order by ...
      //此处需注意先注入条件，再分组、排序，不可颠倒顺序
      //如果存在查询条件
      if (!isEmptyObject(data.where)) {
        option.push({
          $match: data.where
        });
      }

      option.push({
        $group: data.group
      });

      //如果需要排序
      if (!isEmptyObject(data.sortby)) {
        option.push({
          $sort: data.sortby
        });
      }

      collection[operation](option, function(err, result) {
        res.json(result);
      });
      break;
    default:
      collection[operation](data.data, function(err, result) {
        res.json(result);
      });
      break;
  }

};

module.exports = {
  insert: function(req, res, data) {
    data2db(req, res, data, 'insertMany');
  },
  query: function(req, res, data) {
    data2db(req, res, data, 'find');
  },
  delete: function(req, res, data) {
    data2db(req, res, data, 'deleteMany');
  },
  update: function(req, res, data) {
    data2db(req, res, data, 'update');
  },
  aggregate: function(req, res, data) {
    data2db(req, res, data, 'aggregate');
  }
};