const Weather = require('./weather-model');

const addOrUpdateWeather = async (weather) => {
  const transaction = await Weather.sequelize.transaction();
  try {
    const [weatherInstance] = await Weather.findOrCreate({
      where: { activityId: weather.activityId },
      transaction,
    });

    weatherInstance.sky = weather.sky;
    weatherInstance.temperature = weather.temperature;
    weatherInstance.humidity = weather.humidity;
    weatherInstance.wind = weather.wind;
    weatherInstance.precipitation = weather.precipitation;

    await weatherInstance.save({ transaction });
    await transaction.commit();
    return weatherInstance;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  addOrUpdateWeather,
};