var express = require('express');
var router = express.Router();

//用户登录注销
var user = require('../controller/login');

//公共模块
var utils = require('../common');

//var parseurl = require('parseurl');

var token = require('../controller/token');

var assertsDir = require('../conf/app').assertsDir;

var checkLogin = (req, res) => {

  if (utils.isEmptyObject(req.body)) {
    res.json({
      error: 'param Error'
    });
    return;
  }

  //用户登录校验
  var loginInfo = user.login({
    name: req.body.name,
    psw: req.body.psw,
    lastLoginTime: new Date().toLocaleString()
  });

  if (loginInfo.isLogin) {
    req.session.userInfo = loginInfo;

    var day = 86400000;
    Object.assign(req.session.cookie, {
      expires: new Date(Date.now() + day * 7),
      maxAge: day * 7
    });

    //登录成功跳转，默认跳转至主页
    var redirect = req.query.redirect;
    if (!redirect) {
      redirect = "/";
    }
    res.redirect(redirect);
  } else {
    res.json({
      status: 400,
      info: '登录失败'
    });
  }
};

var login = (req, res) => {
  var userInfo = req.session.userInfo;

  if (!userInfo) {
    userInfo = req.session.userInfo = {
      isLogin: false
    };
  }

  //var redirect = parseurl(req).pathname;

  if (!userInfo.isLogin) {
    res.sendFile(process.cwd() + assertsDir + '/login.html');
  } else {
    setInfo2Cookies(req, res);
    res.redirect('/');
  }
};

//将登录信息写至cookies
var setInfo2Cookies = (req, res) => {
  //登录结果写入cookie
  var userInfo = req.session.userInfo;
  res.cookie('user', JSON.stringify({
    name: userInfo.name,
    lastLoginTime: userInfo.lastLoginTime
  }), {
    maxAge: 10 * 24 * 3600 * 1000 //'10d'
  });

  utils.setToken2Cookies(req, res);
};

var logout = (req, res) => {
  user.logout(req);
  res.redirect('/admin/login');
};

var admin = (req, res) => {
  utils.handleAuthCheck(req, res, assertsDir + '/admin.html');
};

/*router exports*/
router.get('/', admin);

//登录页面
router.get('/login', login);

//登录验证
router.post('/login', checkLogin);

router.get('/logout', logout);

module.exports = router;
