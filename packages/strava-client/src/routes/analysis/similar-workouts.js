// find by similar route
// - distance
// - start location
// - max/min values
//  - altitude
//  - 
//  - lat,long

const Router = require('express').Router;
const { findActivityById } = require('../../persistence/activities');
const findSimilarStartDistance = require('../../persistence/activities/findSimilarStartDistance');

const router = new Router();

router.post('/by-route', async (req, res) => {
  try {
    const { body } = req;
    const id = body?.id;

    const activity = await findActivityById(id);

    if (!activity) {
      return res.status(400).json({ activity_not_found: true });
    }

    const combo = await findSimilarStartDistance(activity);
    res.json({ combo });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = {
  similarWorkoutsRouter: router,
};
