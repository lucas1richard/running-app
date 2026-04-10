const Weather = require('./weather-model');

const getWeatherByLatLngDate = async (lat, lng, date) => {
  return Weather.findAll({ where: { lat, lng, date } });
};

module.exports = {
  getWeatherByLatLngDate,
};
