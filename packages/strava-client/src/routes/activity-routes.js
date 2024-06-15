const { Router } = require('express');
const { getComparedRoutes } = require('../controllers/getComparedRoutes');
const findByTimeframe = require('../persistence/activities/findByTimeframe');
const { findRelationsBySimilarRoute } = require('../persistence/activities');

const router = new Router();

router.get('/network', async (req, res) => {
  try {
    const allActivities = await findByTimeframe();

    const allActivityIds = allActivities.map((activity) => activity.id);

    await Promise.allSettled(allActivityIds.map(getComparedRoutes));
    const network = await findRelationsBySimilarRoute();

    return res.json(network)
  } catch (err) {
    console.log(err)
    res.status(500).send(err.message);
  }
});

module.exports = {
  activityRoutesRouter: router,
};
