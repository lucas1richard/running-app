const Weather = require('./weather-model');

const getWeatherByActivityId = async (activityId) => {
  return Weather.findAll({ where: { activityId } });
};

module.exports = {
  getWeatherByActivityId,
};
