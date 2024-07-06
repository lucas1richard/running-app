const { Router } = require('express');
const { getActivityDetails } = require('../../../controllers/getActivityDetails');

const router = Router();

router.get('/:id/detail', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const activity = await getActivityDetails(activityId);
    res.json(activity);
  } catch (err) {
    res.status(500).send(err.message)
  }
});

module.exports = {
  detailsRouter: router,
};
