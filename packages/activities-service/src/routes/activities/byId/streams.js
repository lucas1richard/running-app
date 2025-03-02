const { Router } = require('express');
const { addStreamPin, deleteStreamPin, updateStreamPin, getStreamPins } = require('../../../persistence/streams');
const { getActivityStreams } = require('../../../controllers/getActivityStreams');

const router = new Router();

router.get('/:id/streams', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const keys = req.query?.keys?.split?.(',');
    const response = await getActivityStreams(activityId, keys);
    res.json({ stream: response });
  } catch (err) {
    res.status(500).send(err.message)
  }
});

router.post('/:id/streams/pin', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const { streamKey, index, label, description, latlng } = req.body;

    await addStreamPin({
      streamKey, index, label, description, activityId, latlng,
    });

    const allPins = await getStreamPins(activityId);
    res.json(allPins);
  } catch (err) {
    res.status(500).send(err.message)
  }
});

router.delete('/:id/streams/pin', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const { id, streamKey, index } = req.body;

    await deleteStreamPin({
      id, streamKey, index, activityId,
    });

    const allPins = await getStreamPins(activityId);
    res.json(allPins);
  } catch (err) {
    res.status(500).send(err.message)
  }
});

router.put('/:id/streams/pin', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const { id, streamKey, index, label, description } = req.body;

    await updateStreamPin(activityId, {
      id, streamKey, index, activityId, label, description,
    });

    const allPins = await getStreamPins(activityId);
    res.json(allPins);
  } catch (err) {
    res.status(500).send(err.message)
  }
});

module.exports = {
  streamsRouter: router,
};
