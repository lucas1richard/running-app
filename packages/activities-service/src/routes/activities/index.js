const { Router } = require('express');
const { getAllStreams } = require('../../persistence/setupdb-couchbase');
const summary = require('../../persistence/mysql-activities');
const { deleteRouter } = require('./byId/delete');
const { detailsRouter } = require('./byId/detail');
const { weatherRouter } = require('./byId/weather');
const { streamsRouter } = require('./byId/streams');
const { lapsRouter } = require('./byId/laps');
const { preferencesRouter } = require('./byId/preferences');
const { segmentsRouter } = require('./byId/segments');
const { stravaRouter } = require('./byId/strava');
const { routeRouter } = require('./byId/route');
const { similarActivitiesRouter } = require('./byId/similar-activities');
const { findAllActivities } = require('../../persistence/activities');
const getPRsByDate = require('../../controllers/getPRsByDate');
const getPRs = require('../../controllers/getPRs');
const { listStreamRouter } = require('./listStream');

const router = Router();

// byId routes
router.use([
  deleteRouter,
  detailsRouter,
  lapsRouter,
  preferencesRouter,
  routeRouter,
  segmentsRouter,
  streamsRouter,
  stravaRouter,
  weatherRouter,
  similarActivitiesRouter,
  listStreamRouter,
]);

router.get('/list', async (req, res) => {
  try {
    const forceFetch = req.query.force;

    if (forceFetch) return res.status(400).send('Force fetch is not supported on this endpoint. Use /listStream instead.');
    const existingActivities = await findAllActivities();
    return res.json(existingActivities);
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

router.get('/prs/by-date', async (req, res) => {
  try {
    const prs = await getPRsByDate();
    res.json(prs);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/prs', async (req, res) => {
  try {
    const prs = await getPRs();
    res.json(prs);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = {
  activitiesRouter: router,
};

