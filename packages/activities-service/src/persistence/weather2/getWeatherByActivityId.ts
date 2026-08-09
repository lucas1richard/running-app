import Weather from './weather-model.ts';

const getWeatherByActivityId = async (activityId) => {
  return Weather.findAll({ where: { activityId } });
};

export {
  getWeatherByActivityId,
};
