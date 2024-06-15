const { Router } = require('express');
const { addOrUpdateWeather } = require('../../../persistence/weather');
const { findActivityById } = require('../../../persistence/activities');

const router = new Router();

router.put('/:id/weather', async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await findActivityById(id);
    if (!activity) {
      return res.status(404).send('Activity not found');
    }

    const weatherInstance = await addOrUpdateWeather({
      activityId: id,
      sky: req.body.sky,
      temperature: req.body.temperature,
      humidity: req.body.humidity,
      wind: req.body.wind,
      precipitation: req.body.precipitation,
    });

    res.json(weatherInstance);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = {
  weatherRouter: router,
};
