const { Router } = require('express');
const { getItem, storeItem } = require('../persistence/setupdb-mysql');
const constants = require('../constants');
const testEventEmitter = require('../utils/eventEmitters/testEventEmitter');

const router = new Router();

router.get('/', async (req, res) => {
  try {
    const item = await getItem(1);

    res.json(item || {});
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post('/set-token', async (req, res) => {
  try {
    await storeItem(req.body);

    res.json({});
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/get-constants', async (req, res) => {
  testEventEmitter.emit('shazam', 'Hello World');
  console.trace('shazam');
  res.json(constants);
});

module.exports = {
  adminRouter: router,
};