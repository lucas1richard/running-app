const { Router } = require('express');
const { getItem, storeItem } = require('../persistence/setupdb-mysql');

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

module.exports = {
  adminRouter: router,
};