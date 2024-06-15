const { Router } = require('express');
const { getActivityDetail, updateActivityDetail } = require('../../../persistence/setupdb-couchbase');
const fetchStrava = require('../../../utils/fetchStrava');

const router = new Router();

router.get('/:id/laps', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const detail = await getActivityDetail(activityId);

    if (detail?.has_detailed_laps) {
      return res.json(detail.laps);
    }

    const laps = await fetchStrava(`/activities/${activityId}/laps`);
    await updateActivityDetail(activityId, { laps, has_detailed_laps: true });
    res.json(laps);
  } catch (err) {
    res.status(500).send(err.message)
  }
});

module.exports = {
  lapsRouter: router,
};
