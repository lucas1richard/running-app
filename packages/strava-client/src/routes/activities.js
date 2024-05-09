const { Router } = require('express');
const { STRAVA_ACCESS_TOKEN } = require('../constants');
const { getAccessToken } = require('../database/utils');
const { bulkAddActivities, getActivityDetail, addActivityDetail } = require('../database/setupdb-couchbase');

const router = new Router();

router.get('/list', async (req, res, next) => {
  const accessToken = await getAccessToken();
  const activitiesListRes = await fetch('https://www.strava.com/api/v3/athlete/activities', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
  });
  const activitiesList = await activitiesListRes.json();
  await bulkAddActivities(activitiesList);
  res.json(activitiesList);
});

router.get('/detail/:id', async (req, res, next) => {
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

router.get('/:id/streams', async (req, res, next) => {
  const accessToken = await getAccessToken();
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
  ].join(',');
  const activitiyRes = await fetch(`https://www.strava.com/api/v3/activities/${activityId}/streams?keys=${streamKeys}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
  });
  const activitiy = await activitiyRes.json();

  res.json(activitiy);
});

module.exports = {
  activitiesRouter: router,
};

