const { Router } = require('express');
const { similarWorkoutsRouter } = require('./similar-workouts');

const router = Router();

router.use('/similar-workouts', similarWorkoutsRouter);

module.exports = {
  analysisRouter: router,
};
