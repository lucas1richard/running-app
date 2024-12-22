const { Router } = require('express');
const { getStream, addStream } = require('../../../persistence/setupdb-couchbase');
const fetchStrava = require('../../../utils/fetchStrava');
const { addStreamPin, deleteStreamPin, updateStreamPin, getStreamPins } = require('../../../persistence/streams');

const router = new Router();

router.get('/:id/streams', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const streamKeys = [
      'time',
      'distance',
      'latlng',
      'altitude',
      'velocity_smooth',
      'heartrate',
      'cadence',
      'watts',
      'temp',
      'moving',
      'grade_smooth',
    ];
    const keys = req.query?.keys?.split?.(',') || streamKeys;
    const matchKeys = (streamData) => keys.map(
      (key) => streamData?.find?.(({ type }) => type === key) || { type: key, data: [], notFound: true }
    );

    const cachedStream = await getStream(activityId);
    if (cachedStream) {
      return res.json({ stream: matchKeys(cachedStream.stream) });
    }

    const stream = await fetchStrava(`/activities/${activityId}/streams?keys=${streamKeys.join(',')}`);
    await addStream({ stream }, activityId);
    // await summary.setHasStreams(activityId, true);
    const response = keys.map((key) => stream?.find?.(({ type }) => type === key));
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
