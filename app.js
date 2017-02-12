var express = require('express'),
  session = require('express-session'),
  cors = require('cors'),
  helmet = require('helmet'),
  compression = require('compression'),
  bodyParser = require('body-parser'),
  path = require('path'),
  favicon = require('serve-favicon'),
  cookieParser = require('cookie-parser'),
  app = express();

//security practices
app.use(helmet());

//全局cors则开启以下命令
app.use(cors());

//gzip压缩
app.use(compression());

//disable x-powered-by(security practices)
app.disable('x-powered-by');

app.use(require('less-middleware')(path.join(__dirname, 'public')));

app.use('/', express.static(__dirname + '/public', {
  maxAge: '10d'
}));

app.use(cookieParser());
// see https://github.com/expressjs/body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));

//全局添加处理时间
app.use((req, res, next) => {
  var start = new Date();
  next();
  var ms = new Date() - start;
  res.set('X-Response-Time', ms + 'ms');
});


//全局配置
var config = require('./server/conf/session');

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', 'jade');

/*START:router settings*/
var router = {
  index: require('./server/routes/index'),
  admin: require('./server/routes/admin'),
  api: require('./server/routes/api')
};

app.use('/', router.index);

app.use('/admin', router.admin);

app.use('/api', router.api);

/*END:router settings*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('页面不存在');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
