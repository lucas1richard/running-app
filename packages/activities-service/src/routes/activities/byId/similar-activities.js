
const { Router } = require('express');
const { findRelationsBySimilarRoute } = require('../../../persistence/activities');
// const findSimilarStartDistance = require('../../../persistence/activities/findSimilarStartDistance');
const { getComparedRoutes } = require('../../../controllers/getComparedRoutes');

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

module.exports = {
  similarActivitiesRouter: router,
};