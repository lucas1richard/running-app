import { DataTypes, Model } from 'sequelize';
import { sequelizeMysql } from '../sequelize-mysql.ts';

class HourlyWeather extends Model {
  static async fetchArchiveWeather(lat, lon, date) {
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
    return weatherRes.json();
  }
}

// apparent_temperature
// cloud_cover
// dew_point_2m
// precipitation
// precipitation_probability
// relative_humidity_2m
// temperature_2m
// time
// weather_code
// wind_gusts_10m
// wind_speed_10m

HourlyWeather.init(
  {
    apparent_temperature: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      get() { return Number(this.getDataValue('apparent_temperature')); },
    },
    cloud_cover: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      get() { return Number(this.getDataValue('cloud_cover')); },
    },
    dew_point_2m: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      get() { return Number(this.getDataValue('dew_point_2m')); },
    },
    precipitation: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      get() { return Number(this.getDataValue('precipitation')); },
    },
    precipitation_probability: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      get() { return Number(this.getDataValue('precipitation_probability')); },
    },
    relative_humidity_2m: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      get() { return Number(this.getDataValue('relative_humidity_2m')); },
    },
    temperature_2m: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      get() { return Number(this.getDataValue('temperature_2m')); },
    },
    time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    weather_code: {
      type: DataTypes.INTEGER,
      allowNull: true,
      get() { return Number(this.getDataValue('weather_code')); },
    },
    wind_gusts_10m: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      get() { return Number(this.getDataValue('wind_gusts_10m')); },
    },
    wind_speed_10m: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      get() { return Number(this.getDataValue('wind_speed_10m')); },
    },
  },
  {
    sequelize: sequelizeMysql,
    modelName: 'hourly_weather',
    tableName: 'hourly_weather',
  }
);


export default HourlyWeather;