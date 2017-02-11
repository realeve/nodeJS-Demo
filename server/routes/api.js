var express = require('express');
var sendJson = require("send-data/json");
var router = express.Router();

var token = require('../controller/token');
var db = require('../controller/MySQL');
var settings = require('../conf/api');
var mongodb = require('../controller/MongoDB');

//公共模块
var utils = require('../common');

var assertsDir = require('../conf/app').assertsDir;

var permissionValid = (req, res, next) => {
  //req.body || req.query || req.params
  var params = Object.assign(Object.assign(req.body, req.query), req.params);
  if (typeof params.token == 'undefined') {
    if (typeof req.cookies.token == 'undefined') {
      sendJson(req, res, {
        statusCode: 400,
        body: {
          status: 400,
          error: 'param token not submitted.'
        }
      });
      return;
    }
    params = JSON.parse(req.cookies.token);
  }

  if (settings.needValid) {
    var valid = token.valid(params);
    //本站API自动续期
    //外部访问做数据校验
    utils.setToken2Cookies(req, res, true);
    if (settings.status.COMPLETE !== valid.status) {
      sendJson(req, res, {
        statusCode: valid.status,
        body: valid
      });
      return false;
    }
  }
  next(req, res);
};

var api = (req, res) => {
  permissionValid(req, res, () => {
    res.json({
      data: [{
        name: 'apple',
        price: 12.12
      }, {
        name: 'banana',
        price: 4.50
      }],
      params: req.query,
      apiInfo: {
        version: req.params.version,
        id: req.params.id,
        help: 'http://example.com',
        ip: req.ip.replace(/::ffff:/, '')
      }
    });
  });
};

var createToken = (req, res) => {
  var time = Date.now();
  var tokenStr = token.create(time);
  res.json(tokenStr);
};

var user = {
  add(req, res) {
    permissionValid(req, res, db.add);
  },
  update(req, res) {
    permissionValid(req, res, db.update);
  },
  del(req, res) {
    permissionValid(req, res, db.delete);
  },
  query(req, res) {
    permissionValid(req, res, db.queryById);
  },
  queryAll(req, res) {
    permissionValid(req, res, db.queryAll);
  }
};

var index = (req, res) => {
  utils.handleAuthCheck(req, res, assertsDir + '/api.html');
};


var orders = {
  ASC: 1,
  DESC: -1
};

var mongo = {
  insert(req, res) {
    mongodb.insert(req, res, {
      collection: 'books',
      data: [{
        "title": "MongoDB 从入门到删库",
        "description": "MongoDB is no sql database",
        "by_user": "libin",
        "url": "http://www.mongodb.com",
        "tags": [
          "mongodb",
          "database",
          "NoSQL"
        ],
        "likes": 95
      }]
    });
  },
  query(req, res) {
    //url demo  http://localhost:8000/api/mongo/query?page=1&pagenum=5
    var params = Object.assign(Object.assign(req.body, req.query), req.params);
    var page = Number.parseInt(params.page) || 0;
    var limit = Number.parseInt(params.pagenum) || 0;
    var skip = page * limit;

    mongodb.query(req, res, {
      collection: 'books',
      where: {},
      sortby: {
        likes: orders.DESC
      },
      skip: skip,
      limit: limit
    });
  },
  delete(req, res) {
    mongodb.delete(req, res, {
      collection: 'books',
      data: {
        likes: 95
      }
    });
  },
  update(req, res) {
    mongodb.update(req, res, {
      collection: 'books',
      where: {
        likes: 95
      },
      set: {
        likes: 125
      }
    });
  },
  aggregate(req, res) {
    mongodb.aggregate(req, res, {
      collection: 'books',
      where: {
        likes: {
          $gt: 50,
          $lte: 1000
        }
      },
      group: {
        _id: {
          tags: "$tags",
          url: "$url"
        },
        count: {
          $sum: "$likes"
        },
        max: {
          $max: "$likes"
        },
        min: {
          $min: "$likes"
        },
        avg: {
          $avg: "$likes"
        }
      },
      sortby: {
        count: orders.DESC
      }
    });
  }
};

/*router exports*/


//cors接口
router.get('/', index);

//cors接口
router.get('/v:version/:id/', api);

//getToken
router.get('/token', createToken);

//用户信息增删改查，请求地址相同，发起方式不同
router.get('/user', user.query);
router.post('/user', user.add);
router.delete('/user', user.del);
router.put('/user', user.update);

router.get('/user/all', user.queryAll);

router.get('/mongo/insert', mongo.insert);
router.get('/mongo/query', mongo.query);
router.get('/mongo/delete', mongo.delete);
router.get('/mongo/update', mongo.update);
router.get('/mongo/aggregate', mongo.aggregate);

module.exports = router;
