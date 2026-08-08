import Weather from './weather-model.js';
import { addOrUpdateWeather } from './addOrUpdateWeather.js';
import { getWeatherByActivityId } from './getWeatherByActivityId.js';
import { findActivityById } from '../activities/index.js';

const getOrFetchWeatherByActivity = async ({ activityId, lat, lon, date }) => {
  const existingWeather = await getWeatherByActivityId(activityId);
  if (existingWeather.length) {
    return existingWeather;
  }

  let nextLat = lat;
  let nextLon = lon;
  let nextDate = date;

  if (!nextLat || !nextLon || !nextDate) {
    const activity = await findActivityById(activityId);
    if (!activity?.start_latlng?.length) {
      return [];
    }

    const [activityLat, activityLon] = activity.start_latlng;
    const activityDate = activity.start_date_local || activity.start_date;

    nextLat = nextLat || activityLat;
    nextLon = nextLon || activityLon;
    nextDate = nextDate || (activityDate ? new Date(activityDate).toISOString().split('T')[0] : null);
  }

  if (!nextLat || !nextLon || !nextDate) {
    return [];
  }

  const weatherData = await Weather.fetchArchiveWeather(nextLat, nextLon, nextDate);

  if (!weatherData?.hourly) {
    return [];
  }

  const weatherToStore = weatherData.hourly.time.map((time, index) => ({
    activityId,
    time,
    apparent_temperature: weatherData.hourly.apparent_temperature[index],
    cloud_cover: weatherData.hourly.cloud_cover[index],
    dew_point_2m: weatherData.hourly.dew_point_2m[index],
    precipitation: weatherData.hourly.precipitation[index],
    precipitation_probability: weatherData.hourly.precipitation_probability[index],
    relative_humidity_2m: weatherData.hourly.relative_humidity_2m[index],
    temperature_2m: weatherData.hourly.temperature_2m[index],
    weather_code: weatherData.hourly.weather_code[index],
    wind_gusts_10m: weatherData.hourly.wind_gusts_10m[index],
    wind_speed_10m: weatherData.hourly.wind_speed_10m[index],
    lat: nextLat,
    lng: nextLon,
    date: nextDate,
  }));

  const storedWeather = [];
  for (const weather of weatherToStore) {
    const storedInstance = await addOrUpdateWeather(weather);
    storedWeather.push(storedInstance);
  }

  return storedWeather;
};

export {
  getOrFetchWeatherByActivity,
};
