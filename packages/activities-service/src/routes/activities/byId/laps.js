const { Router } = require('express');
const { getActivityDetail } = require('../../../persistence/setupdb-couchbase');
const receiver = require('../../../messageQueue/receiver');

const router = new Router();

router.get('/:id/laps', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const detail = await getActivityDetail(activityId);

    if (detail?.has_detailed_laps) {
      return res.json(detail.laps);
    }

    await receiver.sendAndAwaitMessage('stravaIngestionService', 'laps', activityId);

    const updated = await getActivityDetail(activityId);

    if (updated?.has_detailed_laps) {
      return res.json(updated.laps);
    }

    return res.status(404).send('Laps not found');
  } catch (err) {
    res.status(500).send(err.message)
  }
});

module.exports = {
  lapsRouter: router,
};
