const Weather = require('./weather-model');

const addOrUpdateWeather = async (weather) => {
  const transaction = await Weather.sequelize.transaction();
  try {
    const [weatherInstance] = await Weather.findOrCreate({
      where: { activityId: weather.activityId },
      transaction,
    });

    weatherInstance.apparent_temperature = weather.apparent_temperature;
    weatherInstance.cloud_cover = weather.cloud_cover;
    weatherInstance.dew_point_2m = weather.dew_point_2m;
    weatherInstance.precipitation = weather.precipitation;
    weatherInstance.precipitation_probability = weather.precipitation_probability;
    weatherInstance.relative_humidity_2m = weather.relative_humidity_2m;
    weatherInstance.temperature_2m = weather.temperature_2m;
    weatherInstance.time = weather.time;
    weatherInstance.weather_code = weather.weather_code;
    weatherInstance.wind_gusts_10m = weather.wind_gusts_10m;
    weatherInstance.wind_speed_10m = weather.wind_speed_10m;

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
