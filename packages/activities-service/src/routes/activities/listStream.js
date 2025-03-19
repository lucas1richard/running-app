const { Router } = require('express');
const { findAllActivities } = require('../../persistence/activities');
const fetchStrava = require('../../utils/fetchStrava');
const { bulkAddActivities } = require('../../persistence/setupdb-couchbase');
const bulkAddActivitiesFromStrava = require('../../persistence/activities/bulkAddActivitiesFromStrava');
const topics = require('../../messageQueue/topics');
const { dispatchFanout } = require('../../messageQueue/client');

const router = Router();

const NUM_ACTIVITIES_PER_REQUEST = 30;
const INTERVAL_TIME = 20; // ms

router.get('/listStream', async (req, res) => {
  try {
    const forceFetch = req.query.force;
    const page = req.query.page || 1;
    const perPage = req.query.per_page || 100;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    if (!forceFetch) {
      const existingActivities = await findAllActivities();
      let counter = 0;
      const intervalId = setInterval(() => {
        const data = `data: ${JSON.stringify(existingActivities.slice(counter * NUM_ACTIVITIES_PER_REQUEST, counter * NUM_ACTIVITIES_PER_REQUEST + NUM_ACTIVITIES_PER_REQUEST))}\n\n`;
        res.write(data);
        counter++;
        if (counter * NUM_ACTIVITIES_PER_REQUEST >= existingActivities.length) {
          clearInterval(intervalId);
          res.end();
        }
      }, INTERVAL_TIME);

      req.on('close', () => {
        clearInterval(intervalId);
        res.end();
      });
    } else {
      const activitiesList = await fetchStrava(`/athlete/activities?per_page=${perPage}&page=${page}`);
      await bulkAddActivities(activitiesList); // couchdb
      const addedRecords = await bulkAddActivitiesFromStrava(activitiesList); // mysql
      addedRecords.forEach((record) => dispatchFanout(topics.ACTIVITY_PULL, JSON.stringify({ id: record.id })))
      const records = await findAllActivities();
      res.json(records);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = {
  listStreamRouter: router,
};
