const { DataTypes, Model } = require('sequelize');
const { sequelizeMysql } = require('../sequelize-mysql');

class HeartZones extends Model {}

HeartZones.init(
  {
    id: { type: DataTypes.MEDIUMINT, allowNull: false, primaryKey: true, autoIncrement: true },
    z1: { type: DataTypes.INTEGER },
    z2: { type: DataTypes.INTEGER },
    z3: { type: DataTypes.INTEGER },
    z4: { type: DataTypes.INTEGER },
    z5: { type: DataTypes.INTEGER },
    start_date: { type: DataTypes.DATEONLY },
  },
  {
    sequelize: sequelizeMysql,
    modelName: 'heartZones',
    tableName: 'heartrate_zones',
  }
);

module.exports = HeartZones;