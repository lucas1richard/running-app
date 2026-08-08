import Weather from './weather-model.js';

const getWeatherByActivityId = async (activityId) => {
  return Weather.findAll({ where: { activityId } });
};

export {
  getWeatherByActivityId,
};
