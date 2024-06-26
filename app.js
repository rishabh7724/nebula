var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const { auth, roleAuthorization } = require('./middleware/auth');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// DB Config
const db = 'mongodb://localhost:27017/auth_db';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
// Bodyparser middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from node_modules/bootstrap
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Use Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.get('/api/admin', auth, roleAuthorization(['admin']), (req, res) => {
  res.json({ msg: 'Welcome admin!' });
});

app.get('/api/manager', auth, roleAuthorization(['admin', 'manager']), (req, res) => {
  res.json({ msg: 'Welcome manager!' });
});

app.get('/api/viewer', auth, roleAuthorization(['admin', 'manager', 'viewer']), (req, res) => {
  res.json({ msg: 'Welcome viewer!' });
});

app.get('/logout',(res,req) => {
  return res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Successfully logged out 😏 🍀" });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

// Connect to MongoDB
mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


module.exports = app;
