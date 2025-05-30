const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(express.static(`${__dirname}/static`));
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.set('trust proxy', 1); // trust first proxy

module.exports = app;
