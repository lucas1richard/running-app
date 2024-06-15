const { Router } = require('express');
const {
  bulkAddActivities,
  getAllStreams,
} = require('../../persistence/setupdb-couchbase');
const summary = require('../../persistence/mysql-activities');
const fetchStrava = require('../../utils/fetchStrava');
const { weatherRouter } = require('./byId/weather');
const { streamsRouter } = require('./byId/streams');
const { detailsRouter } = require('./byId/detail');
const { lapsRouter } = require('./byId/laps');
const { preferencesRouter } = require('./byId/preferences');
const { segmentsRouter } = require('./byId/segments');
const { stravaRouter } = require('./byId/strava');
const { routeRouter } = require('./byId/route');
const { findAllActivities } = require('../../persistence/activities');
const bulkAddActivitiesFromStrava = require('../../persistence/activities/bulkAddActivitiesFromStrava');

const router = new Router();

// byId routes
router.use([
  detailsRouter,
  lapsRouter,
  preferencesRouter,
  routeRouter,
  segmentsRouter,
  streamsRouter,
  stravaRouter,
  weatherRouter,
]);

router.get('/list', async (req, res) => {
  try {
    const forceFetch = req.query.force;
    const page = req.query.page || 1;
    const perPage = req.query.per_page || 100;

    if (!forceFetch) {
      const existingActivities = await findAllActivities();
      if (existingActivities.length > 0) {
        return res.json(existingActivities);
      }
    }

    const activitiesList = await fetchStrava(`/athlete/activities?per_page=${perPage}&page=${page}`);
    await bulkAddActivities(activitiesList); // couchdb
    const records = await bulkAddActivitiesFromStrava(activitiesList); // mysql

    res.json(records);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/summary', async (req, res) => {
  try {
    const activities = await summary.getAll();
    res.json(activities);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/streams/list', async (req, res) => {
  try {
    const allStreams = await getAllStreams();

    res.json(Object.fromEntries(allStreams.map((str) => [str._id, str])));
  } catch (err) {
    res.status(500).send(err.message)
  }
});

module.exports = {
  activitiesRouter: router,
};

