const { Router } = require('express');
const { getComparedSegments } = require('./activities/byId/segments');
const {
  findAllActivities,
  findRelationsBySimilarSegments,
} = require('../persistence/activities');

const router = new Router();

router.get('/network', async (req, res) => {
  try {
    const allActivities = await findAllActivities();
    const allActivityIds = allActivities.map((activity) => activity.id);
    
    await Promise.allSettled(allActivityIds.map(getComparedSegments));

    const network = await findRelationsBySimilarSegments();
    res.json(network);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = {
  segmentsRouter: router,
};
