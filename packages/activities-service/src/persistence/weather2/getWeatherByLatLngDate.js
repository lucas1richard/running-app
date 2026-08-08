import Weather from './weather-model.js';

const getWeatherByLatLngDate = async (lat, lng, date) => {
  return Weather.findAll({ where: { lat, lng, date } });
};

export {
  getWeatherByLatLngDate,
};
