import { Router } from 'express';
import constants from '../../constants.js';

const router = Router();

router.get('/get-contants', async (req, res) => {
  res.json(constants);
});

export {
  router as adminRouter,
};