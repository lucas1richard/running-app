import { Router } from 'express';
import * as constants from '../../constants.ts';

const router = Router();

router.get('/get-contants', async (req, res) => {
  res.json(constants);
});

export {
  router as adminRouter,
};