const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
if (process.env.NODE_ENV === 'test') {
  mongoose.connect('mongodb://localhost/APIAuthenticationTEST', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
} else {
  mongoose.connect('mongodb://localhost/APIAuthentication', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

const app = express();

// Middlewares.
app.use(express.json({ extended: false }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Routes.
app.use('/users', require('./routes/users'));

module.exports = app;
