const { Router } = require('express');
const { STRAVA_ACCESS_TOKEN, athleteAuthorizationCode } = require('../constants');
const { getItem, storeItem } = require('../database/setupdb-mysql');

const router = new Router();

router.get('/', async (req, res, next) => {
  const item = await getItem(1);
  
  res.json(item || {});
});

router.post('/set-token', async (req, res, next) => {
  console.log(req.body)
  const item = await storeItem(req.body);

  res.json({});
});

module.exports = {
  adminRouter: router,
};