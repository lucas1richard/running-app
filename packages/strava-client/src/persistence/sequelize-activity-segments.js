/*
https://developers.strava.com/docs/reference/#api-models-DetailedSegment
{
  "id": 33102402,
  "resource_state": 2,
  "name": "400m to Marathon Finish",
  "activity_type": "Run",
  "distance": 435,
  "average_grade": 1.2,
  "maximum_grade": 4.9,
  "elevation_high": 28.4,
  "elevation_low": 22.3,
  "start_latlng": [
    40.769822,
    -73.979474
  ],
  "end_latlng": [
    40.772819,
    -73.976517
  ],
  "elevation_profile": null,
  "climb_category": 0,
  "city": "New York",
  "state": "New York",
  "country": "United States",
  "private": false,
  "hazardous": false,
  "starred": false
},
*/

const { DataTypes, Model } = require('sequelize');
const { sequelizeMysql } = require('./sequelize-mysql');

class ActivitySegment extends Model {
}

ActivitySegment.init(
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    activity_type: {
      type: DataTypes.ENUM('Run', 'Ride'),
      allowNull: false,
    },
    distance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() { return Number(this.getDataValue('distance')); },
    },
    average_grade: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      get() { return Number(this.getDataValue('average_grade')); },
    },
    maximum_grade: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      get() { return Number(this.getDataValue('maximum_grade')); },
    },
    elevation_high: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      get() { return Number(this.getDataValue('elevation_high')); },
    },
    elevation_low: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      get() { return Number(this.getDataValue('elevation_low')); },
    },
    start_latlng: {
      type: DataTypes.GEOMETRY('POINT'),
      get() { return this.getDataValue('start_latlng')?.coordinates },
    },
    end_latlng: {
      type: DataTypes.GEOMETRY('POINT'),
      get() { return this.getDataValue('end_latlng')?.coordinates },
    },
    climb_category: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    hazardous: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    starred: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeMysql,
    modelName: 'activity_segments',
    tableName: 'activity_segments',
  }
);

module.exports = ActivitySegment;
