const { Router } = require('express');
const RelatedActivities = require('../database/sequelize-related-activities');
const Activity = require('../database/sequelize-activities');
const { getComparedSegments } = require('./activities/byId/segments');

const router = new Router();

router.get('/network', async (req, res) => {
  try {
    const allActivities = await Activity.findAll({});
    const allActivityIds = allActivities.map((activity) => activity.id);
    
    // await Promise.all(allActivityIds.map(getComparedSegments));

    const network = await RelatedActivities.findAll({});
    res.json(network);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = {
  segmentsRouter: router,
};
