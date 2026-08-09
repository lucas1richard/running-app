import { addOrUpdateWeather } from './addOrUpdateWeather.ts';

const addOrUpdateWeatherForActivity = async (activityId, weatherPayload = {}) => {
  return addOrUpdateWeather({
    activityId,
    apparent_temperature: weatherPayload.apparent_temperature,
    cloud_cover: weatherPayload.cloud_cover,
    dew_point_2m: weatherPayload.dew_point_2m,
    precipitation: weatherPayload.precipitation,
    precipitation_probability: weatherPayload.precipitation_probability,
    relative_humidity_2m: weatherPayload.relative_humidity_2m,
    temperature_2m: weatherPayload.temperature_2m,
    time: weatherPayload.time,
    weather_code: weatherPayload.weather_code,
    wind_gusts_10m: weatherPayload.wind_gusts_10m,
    wind_speed_10m: weatherPayload.wind_speed_10m,
  });
};

export {
  addOrUpdateWeatherForActivity,
};
