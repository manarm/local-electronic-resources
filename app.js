const express = require('express'), 
      app = express(),
      createError = require('http-errors'), 
      path = require('path'),
      cookieParser = require('cookie-parser'),
      logger = require('morgan'),
      flash = require('connect-flash'),
      session = require('express-session');
      fs = require('fs');
//const indexRouter = require('./routes/index'),
//      documentRouter = require('./routes/document'),
//      passwordRouter = require('./routes/password');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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

// Middleware to whitelist IPs.
const data = fs.readFileSync('data/ip_whitelist.txt', 'utf-8');
const whitelist = data.split('\n')
  .map(line => line.trim())
  .filter(line => line && line.substring(0,1) != '#');
app.use(function(req, res, next) {
  var ip = req.ip || 
          req.headers['x-forwarded-for'] || 
          req.connection.remoteAddress || 
          req.socket.remoteAddress ||
          req.connection.socket.remoteAddress;
  if (whitelist.includes(ip)) {
    next();
  } else {
    // TODO: create "no access" page w. ezproxy link.
    // This will return a blank page.
    res.end();
  }
});
console.log('IP whitelist configured: ' + whitelist);

// Mount routers.
app.use('/', require('./routes/index'));
app.use('/', require('./routes/document'));
app.use('/', require('./routes/password'));

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

// Get address:port from env and start listening.
// Defaults to localhost:3000 if not present in env.
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
var port = normalizePort(process.env.PORT || '3000');
var address = (process.env.IP || '127.0.0.1');
app.listen(port, address, function() {
  console.log('Listening at ' + address + ':' + port);
});