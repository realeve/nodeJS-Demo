var mysql = require('mysql');
var $conf = require('../conf/db');
var $sql = require('./sqlMapping');
var logger = require('winston');
var sendJson = require("send-data/json");

// 使用连接池，提升性能
//var pool  = mysql.createPool($util.extend({}, $conf.mysql));
var pool = mysql.createPool($conf.mysql);

// 向前台返回JSON方法的简单封装
var jsonWrite = (req, res, ret) => {
  if (typeof ret === 'undefined') {
    sendJson(req, res, {
      statusCode: 400,
      body: {
        code: '1',
        msg: '操作失败'
      }
    });
  } else {
    res.json(ret);
  }
};

var errorHandle = (err, param) => {
  if (err) {
    logger.error('Error occured.', {
      time: new Date().toLocaleString(),
      pid: process.pid,
      param: param,
      errInfo: err
    });
  }
};

module.exports = {
  add(req, res, next) {
    pool.getConnection((err, connection) => {
      // 获取前台页面传过来的参数
      // req.body || req.query || req.params
      var param = Object.assign(Object.assign(req.body, req.query), req.params);

      // 建立连接，向表中插入值
      // name及age参数需修改为通用(自动从cache中获取)
      connection.query($sql.insert, [param.name, param.age], (err, result) => {
        if (result) {
          result = {
            code: 200,
            msg: '增加成功'
          };
        }
        //错误处理
        errorHandle(err, param);

        // 以json形式，把操作结果返回给前台页面
        jsonWrite(req, res, result);

        // 释放连接
        connection.release();
      });
    });
  },
  delete(req, res, next) {
    // 获取前台页面传过来的参数
    var param = Object.assign(Object.assign(req.body, req.query), req.params);
    // delete by Id
    pool.getConnection((err, connection) => {
      var id = param.id;
      connection.query($sql.delete, id, (err, result) => {
        //错误处理
        errorHandle(err, param);
        // if (result.affectedRows > 0) {
        // 	result = ;
        // } else {
        // 	result = void 0;
        // }
        if (err) {
          jsonWrite(req, res, result);
        } else {
          jsonWrite(req, res, {
            code: 200,
            msg: '删除成功'
          });
        }
        connection.release();
      });
    });
  },
  update(req, res, next) {
    // update by id
    // param.name|age|id参数需做修改以适应所有要求
    var param = Object.assign(Object.assign(req.body, req.query), req.params);
    if (param.name == null || param.age == null || param.id == null) {
      jsonWrite(req, res, undefined);
      return;
    }

    pool.getConnection((err, connection) => {
      connection.query($sql.update, [param.name, param.age, +param.id], (err, result) => {
        //错误处理
        errorHandle(err, param);
        jsonWrite(req, res, result);
        connection.release();
      });
    });

  },
  queryById(req, res, next) {
    var id = +req.query.id; // 为了拼凑正确的sql语句，这里要转下整数
    pool.getConnection((err, connection) => {
      connection.query($sql.queryById, id, (err, result) => {
        //错误处理
        errorHandle(err);
        jsonWrite(req, res, result);
        connection.release();

      });
    });
  },
  queryAll(req, res, next) {
    pool.getConnection((err, connection) => {
      connection.query($sql.queryAll, (err, result) => {
        //错误处理
        errorHandle(err);
        jsonWrite(req, res, result);
        connection.release();
      });
    });
  }

};
