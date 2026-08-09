import Weather from './weather-model.ts';

const getWeatherByLatLngDate = async (lat, lng, date) => {
  return Weather.findAll({ where: { lat, lng, date } });
};

export {
  getWeatherByLatLngDate,
};
