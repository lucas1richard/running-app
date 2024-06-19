const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(express.static(`${__dirname}/static`));
app.use(bodyParser.json());
app.use(cors());

app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));
app.use(passport.initialize());
app.use(passport.session());

module.exports = app;
