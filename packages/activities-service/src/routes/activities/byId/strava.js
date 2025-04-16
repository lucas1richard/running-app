const { Router } = require('express');
const { updateActivityDetail } = require('../../../persistence/setupdb-couchbase');
const { updateActivityById } = require('../../../persistence/activities');
const receiver = require('../../../messageQueue/receiver');

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

module.exports = {
  stravaRouter: router,
};
