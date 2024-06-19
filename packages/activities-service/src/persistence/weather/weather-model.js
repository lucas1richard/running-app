const { DataTypes, Model } = require('sequelize');
const { sequelizeMysql } = require('../sequelize-mysql');

class Weather extends Model {
}

Weather.init(
  {
    sky: {
      type: DataTypes.ENUM('sunny', 'partly cloudy', 'mostly cloudy', 'overcast'),
      allowNull: true,
    },
    precipitation: {
      type: DataTypes.ENUM('none', 'light', 'moderate', 'heavy', 'torrential'),
      allowNull: true,
    },
    temperature: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      get() { return Number(this.getDataValue('temperature')); },
    },
    temperature_unit: {
      type: DataTypes.ENUM('C', 'F'),
      defaultValue: 'F',
      allowNull: true,
    },
    humidity: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      get() { return Number(this.getDataValue('humidity')); },
    },
    wind: {
      type: DataTypes.ENUM('calm', 'light', 'moderate', 'strong', 'gale'),
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeMysql,
    modelName: 'weather',
    tableName: 'weather',
  }
);


module.exports = Weather;