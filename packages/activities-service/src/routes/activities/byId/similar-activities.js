const { Router } = require('express');
const { findRelationsBySimilarRoute, findActivityById } = require('../../../persistence/activities');
// const findSimilarStartDistance = require('../../../persistence/activities/findSimilarStartDistance');
const { getComparedRoutes } = require('../../../controllers/getComparedRoutes');
const findBySimilarStart = require('../../../persistence/activities/findBySimilarStart');

const router = new Router();

router.get('/:id/quick-similar', async (req, res) => {
  try {
    const activityId = req.params?.id;
    await getComparedRoutes(activityId);
    const network = await findRelationsBySimilarRoute(activityId);
    return res.json(network);

    // const activity = await findActivityById(id);

    // if (!activity) {
    //   return res.status(400).json({ activity_not_found: true });
    // }

    // const combo = await findSimilarStartDistance(activity);
    // res.json(combo);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/:id/find-by-start', async (req, res) => {
  try {
    const activityId = req.params.id;
    const activity = await findActivityById(activityId);
    const similarStart = await findBySimilarStart(activity, req.query?.radius);
    return res.json(similarStart);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = {
  similarActivitiesRouter: router,
};
