const { Router } = require('express');
const { getAccessToken } = require('../database/utils');
const {
  bulkAddActivities,
  getActivityDetail,
  addActivityDetail,
  getAllActivities,
  getStream,
  addStream,
  getAllStreams,
} = require('../database/setupdb-couchbase');
const summary = require('../database/mysql-activities');

const router = new Router();

router.get('/list', async (req, res) => {
  const forceFetch = req.query.force;
  if (!forceFetch) {
    const existingActivities = await getAllActivities();
    if  (existingActivities.length > 0) {
      return res.json(existingActivities);
    }
  }

  const accessToken = await getAccessToken();
  const activitiesListRes = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=100&page=1', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
  });
  const activitiesList = await activitiesListRes.json();
  
  await bulkAddActivities(activitiesList); // couchdb
  await summary.bulkAdd(activitiesList); // mysql

  res.json(activitiesList);
});

router.get('/detail/:id', async (req, res) => {
  const activityId = req.params?.id;
  const detail = await getActivityDetail(activityId);
  if (detail) {
    return res.json(detail);
  }
  const accessToken = await getAccessToken();
  const activitiyRes = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
  });
  const activitiy = await activitiyRes.json();
  await addActivityDetail(activitiy);
  res.json(activitiy);
});

router.get('/:id/streams', async (req, res) => {
  const activityId = req.params?.id;

  const cachedStream = await getStream(activityId);
  if (cachedStream) {
    await summary.setHasStreams(activityId, true);
    return res.json(cachedStream);
  }

  const accessToken = await getAccessToken();
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
  ].join(',');
  const streamRes = await fetch(`https://www.strava.com/api/v3/activities/${activityId}/streams?keys=${streamKeys}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
  });
  const stream = await streamRes.json();
  await addStream({ stream }, activityId);
  await summary.setHasStreams(activityId, true);
  res.json({ stream });
});

router.get('/streams/list', async (req, res) => {
  const allStreams = await getAllStreams();

  res.json(Object.fromEntries(allStreams.map((str) => [str._id, str])));
});

router.get('/summary', async (req, res) => {
  const activities = await summary.getAll();
  res.json(activities);
});

module.exports = {
  activitiesRouter: router,
};

