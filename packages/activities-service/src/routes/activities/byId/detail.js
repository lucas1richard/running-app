const { Router } = require('express');
const { getActivityDetails } = require('../../../controllers/getActivityDetails');
const { calculateActivityBestEfforts } = require('../../../controllers/calculateActivityBestEfforts');

const router = Router();

router.get('/:id/detail', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const activity = await getActivityDetails(activityId);
    const bestEfforts = await calculateActivityBestEfforts(activityId);
    res.json({
      ...activity,
      bestEfforts,
    });
  } catch (err) {
    res.status(500).send(err.message)
  }
});

module.exports = {
  detailsRouter: router,
};
