// express framework
var express = require('express');
// path
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
// cookie
var cookieParser = require('cookie-parser');
// for POST method
var bodyParser = require('body-parser');
// 파일을 제어하는 모듈
var sassMiddleware = require('node-sass-middleware');
//
var session = require('express-session');

// sass를 쓸 수 있게 함.
var sassMiddleware = require('node-sass-middleware');

// 경로를 설정
var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// html예쁘게 만들기
app.locals.pretty = true;

// Pug의 local에 moment라이브러리와 querystring 라이브러리를 사용할 수 있도록.
//app.locals.moment = require('moment');
//app.locals.querystring = require('querystring');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));
// Router
app.use('/', index);
app.use('/users', users);

// sass, scss를 사용할 수 있도록
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  debug: true,
  sourceMap: true
}));

// session을 사용할 수 있도록.
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'long-long-long-secret-string-1313513tefgwdsvbjkvasd'
}));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
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
