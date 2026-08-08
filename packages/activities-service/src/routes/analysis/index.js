import { Router } from 'express';
import { similarWorkoutsRouter } from './similar-workouts.js';

const router = Router();

router.use('/similar-workouts', similarWorkoutsRouter);

export {
  router as analysisRouter,
};
