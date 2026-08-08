import { Router } from 'express';
import { getItem, storeItem } from '../persistence/setupdb-mysql.js';
import * as constants from '../constants.js';

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
  res.json(constants);
});

export {
  router as adminRouter,
};