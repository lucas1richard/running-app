const { Router } = require('express');
const Weather = require('../../../persistence/sequelize-weather');
const Activity = require('../../../persistence/sequelize-activities');

const router = new Router();

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
  weatherRouter: router,
};
