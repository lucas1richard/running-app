const { Router } = require('express');
const { getStream, addStream } = require('../../../database/setupdb-couchbase');
const fetchStrava = require('../../../utils/fetchStrava');

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
      (key) => streamData?.find(({ type }) => type === key) || { type: key, data: [], notFound: true }
    );

    const cachedStream = await getStream(activityId);
    if (cachedStream) {
      return res.json({ stream: matchKeys(cachedStream.stream) });
    }

    const stream = await fetchStrava(`/activities/${activityId}/streams?keys=${streamKeys.join(',')}`);
    await addStream({ stream }, activityId);
    const response = keys.map((key) => stream?.find(({ type }) => type === key));
    res.json({ stream: response });
  } catch (err) {
    res.status(500).send(err.message)
  }
});

module.exports = {
  streamsRouter: router,
};
