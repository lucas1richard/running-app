const { Router } = require('express');
const { getItem, storeItem } = require('../database/setupdb-mysql');

const router = new Router();

router.get('/', async (req, res) => {
  const item = await getItem(1);
  
  res.json(item || {});
});

router.post('/set-token', async (req, res) => {
  await storeItem(req.body);

  res.json({});
});

module.exports = {
  adminRouter: router,
};