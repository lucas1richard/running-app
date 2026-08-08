import { Router } from 'express';
import { updateActivityDetail } from '../../../persistence/setupdb-couchbase.js';
import { updateActivityById } from '../../../persistence/activities/index.js';
import receiver from '../../../messageQueue/receiver.js';

const router = new Router();

router.put('/:id', async (req, res) => {
  try {
    const id = req.params?.id;
    const body = req.body;
    if (!body) return res.status(400).send('request body is required');

    const stravaRes = await receiver.sendAndAwaitMessage(
      'stravaIngestionService',
      'update',
      { activityId: id, updates: body }
    );

    if (stravaRes.error) {
      return res.status(500).send(stravaRes.error);
    }

    await updateActivityById(id, body);
    if (body.description) {
      await updateActivityDetail(id, { description: body.description });
    }

    res.json(stravaRes);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export {
  router as stravaRouter,
};
