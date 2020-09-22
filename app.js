require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const books = require('google-books-search');

//teste com API

// require database configuration
require('./configs/db.config');

//Routers
const indexRouter = require('./routes/index.routes');
const authRouter = require('./routes/auth.routes');
const app = express();

//use session here:
require('./configs/session.config')(app);

// Express View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// Middleware Setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
const app_name = require('./package.json').name;
const debug = require('debug')(
  `${app_name}:${path.basename(__filename).split('.')[0]}`
);

//Routes Middleware
app.use('/', indexRouter);
app.use('/', authRouter);

//catch missing routes to error handler
app.use((req, res, next) => next(createError(404)));

app.use((error, req, res) => {
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};
  res.status(error.status || 500);
  res.render('error');
});
// default value for title local
// app.locals.title = 'Express - Generated with IronGenerator';

module.exports = app;
