const { addOrUpdateWeather } = require('./addOrUpdateWeather');
const { addOrUpdateWeatherForActivity } = require('./addOrUpdateWeatherForActivity');
const { getWeatherByActivityId } = require('./getWeatherByActivityId');
const { getWeatherByLatLngDate } = require('./getWeatherByLatLngDate');
const { getOrFetchWeatherByActivity } = require('./getOrFetchWeatherByActivity');

module.exports = {
  addOrUpdateWeather,
  addOrUpdateWeatherForActivity,
  getWeatherByActivityId,
  getWeatherByLatLngDate,
  getOrFetchWeatherByActivity,
};