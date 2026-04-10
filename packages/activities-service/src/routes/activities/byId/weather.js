const { Router } = require('express');
const { addOrUpdateWeatherForActivity, getOrFetchWeatherByActivity } = require('../../../persistence/weather2');
const { findActivityById } = require('../../../persistence/activities');
const { logger } = require('../../../utils/logger');

const router = new Router();

router.put('/:id/weather', async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await findActivityById(id);
    if (!activity) {
      return res.status(404).send('Activity not found');
    }

    const weatherInstance = await addOrUpdateWeatherForActivity(id, req.body);

    res.json(weatherInstance);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/:id/weather', async (req, res) => {
  try {
    const { id } = req.params;
    const weatherInstance = await getOrFetchWeatherByActivity({
      activityId: id,
    });

    if (!weatherInstance.length) {
      logger.warn(
        `Weather data not found for activity ${id} after checking stored records and fetch fallback`,
        { service: 'activities-service', activityId: id }
      );
      return res.status(404).send('Weather data not found');
    }

    res.json(weatherInstance);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = {
  weatherRouter: router,
};
