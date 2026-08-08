import { Router } from 'express';
import { getAllStreams } from '../../persistence/setupdb-couchbase.js';
import { getAll as summaryGetAll } from '../../persistence/mysql-activities.js';
import { deleteRouter } from './byId/delete.js';
import { detailsRouter } from './byId/detail.js';
import { weatherRouter } from './byId/weather.js';
import { streamsRouter } from './byId/streams.js';
import { lapsRouter } from './byId/laps.js';
import { preferencesRouter } from './byId/preferences.js';
import { segmentsRouter } from './byId/segments.js';
import { stravaRouter } from './byId/strava.js';
import { routeRouter } from './byId/route.js';
import { similarActivitiesRouter } from './byId/similar-activities.js';
import { findAllActivities } from '../../persistence/activities/index.js';
import getPRsByDate from '../../controllers/getPRsByDate.js';
import getPRs from '../../controllers/getPRs.js';
import { listStreamRouter } from './listStream.js';
import { query } from '../../persistence/mysql-connection.js';
import { getActivitiesInBoundsSql } from '../../persistence/sql-queries/index.js';

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
    const activities = await summaryGetAll();
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

router.get('/in-bounds', async (req, res) => {
  try {
    const { north, south, east, west } = req.query;
    if (!north || !south || !east || !west) {
      return res.status(400).send('Missing required query parameters: north, south, east, west');
    }
    const activities = await query(getActivitiesInBoundsSql, [
      parseFloat(north),
      parseFloat(south),
      parseFloat(east),
      parseFloat(west),
    ]);
    res.json(activities);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export {
  router as activitiesRouter,
};

