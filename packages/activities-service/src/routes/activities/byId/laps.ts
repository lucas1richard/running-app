import { Router } from 'express';
import { getActivityDetail } from '../../../persistence/setupdb-couchbase.ts';
import receiver from '../../../messageQueue/receiver.ts';

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
    res.status(500).send(err.message);
  }
});

export {
  router as lapsRouter,
};
