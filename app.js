const express = require('express'), 
      app = express(),
      createError = require('http-errors'), 
      path = require('path'),
      cookieParser = require('cookie-parser'),
      logger = require('morgan'),
      flash = require('connect-flash'),
      session = require('express-session');
      fs = require('fs');
const indexRouter = require('./routes/index'),
      documentRouter = require('./routes/document'),
      passwordRouter = require('./routes/password');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Flash middleware used for Bootstrap alerts.
// Requires session.
app.use(session({ cookie: { maxAge: 60000 }, 
                  secret: '42',
                  resave: false, 
                  saveUninitialized: false}));
app.use(flash());
app.use(function(req, res, next) {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

// Mount routers.
app.use('/', indexRouter);
app.use('/', documentRouter);
app.use('/', passwordRouter);

// Error handling.
app.use(function(req, res, next) {
  next(createError(404));
});
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;