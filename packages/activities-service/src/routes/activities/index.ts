import { Router } from 'express';
import { getAllStreams } from '../../persistence/setupdb-couchbase.ts';
import { getAll as summaryGetAll } from '../../persistence/mysql-activities.ts';
import { deleteRouter } from './byId/delete.ts';
import { detailsRouter } from './byId/detail.ts';
import { weatherRouter } from './byId/weather.ts';
import { streamsRouter } from './byId/streams.ts';
import { lapsRouter } from './byId/laps.ts';
import { preferencesRouter } from './byId/preferences.ts';
import { segmentsRouter } from './byId/segments.ts';
import { stravaRouter } from './byId/strava.ts';
import { routeRouter } from './byId/route.ts';
import { similarActivitiesRouter } from './byId/similar-activities.ts';
import { findAllActivities } from '../../persistence/activities/index.ts';
import getPRsByDate from '../../controllers/getPRsByDate.ts';
import getPRs from '../../controllers/getPRs.ts';
import { listStreamRouter } from './listStream.ts';
import { query } from '../../persistence/mysql-connection.ts';
import { getActivitiesInBoundsSql } from '../../persistence/sql-queries/index.ts';

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
    res.status(500).send(err.message);
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

