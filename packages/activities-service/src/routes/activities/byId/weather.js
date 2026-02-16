const { Router } = require('express');
const { addOrUpdateWeather, getWeatherByLatLngDate } = require('../../../persistence/weather2');
const { findActivityById } = require('../../../persistence/activities');

const router = new Router();

router.put('/:id/weather', async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await findActivityById(id);
    if (!activity) {
      return res.status(404).send('Activity not found');
    }

    const weatherInstance = await addOrUpdateWeather({
      activityId: id,
      apparent_temperature: req.body.apparent_temperature,
      cloud_cover: req.body.cloud_cover,
      dew_point_2m: req.body.dew_point_2m,
      precipitation: req.body.precipitation,
      precipitation_probability: req.body.precipitation_probability,
      relative_humidity_2m: req.body.relative_humidity_2m,
      temperature_2m: req.body.temperature_2m,
      time: req.body.time,
      weather_code: req.body.weather_code,
      wind_gusts_10m: req.body.wind_gusts_10m,
      wind_speed_10m: req.body.wind_speed_10m,
    });

    res.json(weatherInstance);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/:id/weather', async (req, res) => {
  try {
    const { lat, lon, date } = req.query;
    const weatherInstance = await getWeatherByLatLngDate(lat, lon, date);
    if (!weatherInstance.length) {
      const query = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        start_date: date,
        end_date: date,
        daily: [
          'sunset',
          'sunrise',
        ].join(','),
        hourly: [
          'temperature_2m',
          'wind_speed_10m',
          'weather_code',
          'apparent_temperature',
          'precipitation',
          'wind_gusts_10m',
          'precipitation_probability',
          'relative_humidity_2m',
          'dew_point_2m',
          'cloud_cover',
        ].join(','),
        timezone: 'America/New_York',
      });

      const weatherRes = await fetch(`https://archive-api.open-meteo.com/v1/archive?${query.toString()}`);
      const weatherData = await weatherRes.json();

      if (!weatherData?.hourly) {
        return res.status(404).send('Weather data not found');
      }

      const weatherToStore = weatherData.hourly.time.map((time, index) => ({
        activityId: req.params.id,
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
        lat,
        lng: lon,
        date,
      }));

      const storedWeather = [];
      for (const weather of weatherToStore) {
        // Store each weather instance in the database
        const storedInstance = await addOrUpdateWeather(weather);
        storedWeather.push(storedInstance);
      }

      return res.json(storedWeather);
    }

    res.json(weatherInstance);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = {
  weatherRouter: router,
};
