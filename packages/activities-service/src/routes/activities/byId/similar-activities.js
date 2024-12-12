
const { Router } = require('express');
const { findActivityById } = require('../../../persistence/activities');
const findSimilarStartDistance = require('../../../persistence/activities/findSimilarStartDistance');

const router = new Router();

router.get('/:id/quick-similar', async (req, res) => {
  try {
    const id = req.params?.id;

    const activity = await findActivityById(id);

    if (!activity) {
      return res.status(400).json({ activity_not_found: true });
    }

    const combo = await findSimilarStartDistance(activity);
    res.json(combo);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = {
  similarActivitiesRouter: router,
};