var settings = require('./conf/api');
var token = require('./controller/token');

var isEmptyObject = (e) => {
  var t;
  for (t in e)
    return false;
  return true;
};

var handleAuthCheck = (req, res, urlIsLogin, urlFail = '/admin/login') => {
  var userInfo = req.session.userInfo;

  if (!userInfo) {
    userInfo = req.session.userInfo = {
      isLogin: false
    };
  }

  if (userInfo.isLogin) {
    res.sendFile(process.cwd() + urlIsLogin);
    return;
  } else {
    res.redirect(urlFail);
  }
};


//forced:强制更新token;
var setToken2Session = (req, res, forced = false) => {
  var tokenSession = req.session.token || {};
  var time = Date.now();
  //未过期则不更新token
  if (!forced && typeof tokenSession != 'undefined' && typeof tokenSession.expired != 'undefined' && tokenSession.expired > time) {
    return;
  }

  var tokenStr = token.create(time);
  tokenStr.expired = settings.expired * 60 * 1000 + tokenStr.time;
  req.session.token = tokenStr;
};

var setToken2Cookies = (req, res, forced = false) => {
  var tokenCookies, tokenStr;
  var time = Date.now();
  if (req.cookies.token) {
    tokenCookies = JSON.parse(req.cookies.token);
  } else {
    tokenCookies = token.create(time);
  }
  //未过期则不更新token
  if (!forced && typeof tokenCookies != 'undefined' && typeof tokenCookies.expired != 'undefined' && tokenCookies.expired > time) {
    return;
  }
  tokenStr = token.create(time);
  res.cookie('token', JSON.stringify({
    token: tokenStr.token,
    time: tokenStr.time,
    expired: settings.expired * 60 * 1000 + tokenStr.time
  }));
};

module.exports = {
  isEmptyObject,
  handleAuthCheck,
  setToken2Session,
  setToken2Cookies
};
