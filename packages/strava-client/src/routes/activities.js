const { Router } = require('express');
const {
  bulkAddActivities,
  getActivityDetail,
  addActivityDetail,
  getStream,
  addStream,
  getAllStreams,
  updateActivityDetail,
  getActivityPreferences,
  updateActivityPreferences,
} = require('../database/setupdb-couchbase');
const summary = require('../database/mysql-activities');
const Activity = require('../database/sequelize-activities');
const fetchStrava = require('../utils/fetchStrava');
const Weather = require('../database/sequelize-weather');

const router = new Router();

router.get('/list', async (req, res) => {
  try {
    const forceFetch = req.query.force;
    const page = req.query.page || 1;
    const perPage = req.query.per_page || 100;

    if (!forceFetch) {
      const existingActivities = await Activity.findAll({
        order: [['start_date', 'DESC']],
        where: { sport_type: 'Run' },
      });
      if (existingActivities.length > 0) {
        return res.json(existingActivities);
      }
    }

    const activitiesList = await fetchStrava(`/athlete/activities?per_page=${perPage}&page=${page}`);
    await bulkAddActivities(activitiesList); // couchdb
    const records = await Activity.bulkAddFromStrava(activitiesList); // mysql

    res.json(records);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/:id/detail', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const detail = await getActivityDetail(activityId);
    if (detail) {
      return res.json(detail);
    }
    const activitiy = await fetchStrava(`/activities/${activityId}`);
    await addActivityDetail(activitiy);
    res.json(activitiy);
  } catch (err) {
    res.status(500).send(err.message)
  }
});

router.get('/:id/laps', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const detail = await getActivityDetail(activityId);

    if (detail?.has_detailed_laps) {
      return res.json(detail.laps);
    }

    const laps = await fetchStrava(`/activities/${activityId}/laps`);
    await updateActivityDetail(activityId, { laps, has_detailed_laps: true });
    res.json(laps);
  } catch (err) {
    res.status(500).send(err.message)
  }
});

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
      await summary.setHasStreams(activityId, true);
      return res.json({ stream: matchKeys(cachedStream.stream) });
    }

    const stream = await fetchStrava(`/activities/${activityId}/streams?keys=${streamKeys.join(',')}`);
    await addStream({ stream }, activityId);
    await summary.setHasStreams(activityId, true);
    const response = keys.map((key) => stream?.find(({ type }) => type === key));
    res.json({ stream: response });
  } catch (err) {
    res.status(500).send(err.message)
  }
});

router.get('/:id/preferences', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const preferences = await getActivityPreferences(activityId) || {};
    res.json(preferences);
  } catch (err) {
    res.status(500).send(err.message)
  }
});

router.put('/:id/preferences', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const preferences = req.body;
    await updateActivityPreferences(activityId, preferences);
    res.json(preferences);
  } catch (err) {
    res.status(500).send(err.message)
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params?.id;
    const body = req.body;
    if (!body) return res.status(400).send('request body is required');

    const stravaRes = await fetchStrava(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(req.body),
    });

    await Activity.update({ ...req.body }, { where: { id } });
    if (body.description) {
      await updateActivityDetail(id, { description: body.description });
    }

    res.json(stravaRes);
  } catch (err) {
    next(err);
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

router.get('/summary', async (req, res) => {
  try {
    const activities = await summary.getAll();
    res.json(activities);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put('/:id/weather', async (req, res) => {
  const transaction = await Weather.sequelize.transaction();
  try {
    const { id } = req.params;
    const activity = await Activity.findByPk(id);
    if (!activity) {
      return res.status(404).send('Activity not found');
    }

    
    const [weatherInstance] = await Weather.findOrCreate({
      where: { activityId: id },
      transaction,
    });

    weatherInstance.sky = req.body.sky;
    weatherInstance.temperature = req.body.temperature;
    weatherInstance.humidity = req.body.humidity;
    weatherInstance.wind = req.body.wind;
    weatherInstance.precipitation = req.body.precipitation;

    await weatherInstance.save({ transaction });
    await transaction.commit();
    res.json(weatherInstance);
  } catch (error) {
    await transaction.rollback();
    res.status(500).send(error.message);
  }
});

module.exports = {
  activitiesRouter: router,
};

