const { Router } = require('express');
const { findAllActivitiesStream } = require('../../persistence/activities');
const fetchStrava = require('../../utils/fetchStrava');
const { bulkAddActivities } = require('../../persistence/setupdb-couchbase');
const bulkAddActivitiesFromStrava = require('../../persistence/activities/bulkAddActivitiesFromStrava');
const topics = require('../../messageQueue/topics');
const { dispatchFanout } = require('../../messageQueue/client');
const { logger } = require('../../utils/logger');

const router = Router();

router.get('/listStream', async (req, res) => {
  const forceFetch = req.query.force;
  const page = req.query.page || 1;
  const perPage = req.query.per_page || 100;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  try {
    if (forceFetch) {
      const activitiesList = await fetchStrava(`/athlete/activities?per_page=${perPage}&page=${page}`);
      await bulkAddActivities(activitiesList); // couchdb
      const addedRecords = await bulkAddActivitiesFromStrava(activitiesList); // mysql
      addedRecords.forEach((record) => dispatchFanout(topics.ACTIVITY_PULL, JSON.stringify({ id: record.id })));
    }
    const readableStream = await findAllActivitiesStream();
    readableStream.resume();

    for await (const batch of readableStream) {
      res.write(`data: ${JSON.stringify(batch)}\n\n`); // send each row immediately
    }
    logger.info('End of stream');
    res.write('event: close\ndata: Stream closed\n\n');

    res.end();
  } catch (err) {
    console.error('Error in streaming activities:', err);
    res.write('event: error\ndata: Error in streaming activities\n\n');
    res.end();
  }
});

module.exports = {
  listStreamRouter: router,
};
