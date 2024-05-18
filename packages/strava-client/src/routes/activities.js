const { Router } = require('express');
const {
  bulkAddActivities,
  getActivityDetail,
  addActivityDetail,
  getStream,
  addStream,
  getAllStreams,
} = require('../database/setupdb-couchbase');
const summary = require('../database/mysql-activities');
const Activity = require('../database/sequelize-activities');
const fetchStrava = require('../utils/fetchStrava');
const ZonesCache = require('../database/sequelize-zones-cache');

const router = new Router();

router.get('/list', async (req, res) => {
  const forceFetch = req.query.force;
  const page = req.query.page || 1;
  const perPage = req.query.per_page || 100;

  if (!forceFetch) {
    const existingActivities = await Activity.findAll({
      order: [['start_date', 'DESC']],
      where: { sport_type: 'Run' },
      include: [{
        model: ZonesCache,
        attributes: [
          'seconds_z1',
          'seconds_z2',
          'seconds_z3',
          'seconds_z4',
          'seconds_z5',
        ],
      }],
    });
    if  (existingActivities.length > 0) {
      return res.json(existingActivities);
    }
  }

  const activitiesList = await fetchStrava(`/athlete/activities?per_page=${perPage}&page=${page}`);
  await bulkAddActivities(activitiesList); // couchdb
  const records = await Activity.bulkAddFromStrava(activitiesList); // mysql

  res.json(records);
});

router.get('/:id/detail', async (req, res) => {
  const activityId = req.params?.id;
  const detail = await getActivityDetail(activityId);
  if (detail) {
    return res.json(detail);
  }
  const activitiy = await fetchStrava(`/activities/${activityId}`);
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
  const stream = await fetchStrava(`/activities/${activityId}/streams?keys=${streamKeys}`);
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

