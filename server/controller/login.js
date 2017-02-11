var parseurl = require('parseurl');

var login = (userInfo) => {
  return Object.assign(userInfo, {
    isLogin: true
  });
};

var logout = (req) => {
  if (typeof req.session.userInfo != 'undefined') {
    req.session.userInfo.isLogin = false;
  }
  req.session.destroy();
};

module.exports = {
  login,
  logout
};
