const { DataTypes, Model } = require('sequelize');
const { sequelizeMysql } = require('../sequelize-mysql');

class ZonesCache extends Model {}

ZonesCache.init(
  {
    seconds_z1: { type: DataTypes.INTEGER },
    seconds_z2: { type: DataTypes.INTEGER },
    seconds_z3: { type: DataTypes.INTEGER },
    seconds_z4: { type: DataTypes.INTEGER },
    seconds_z5: { type: DataTypes.INTEGER },
  },
  {
    sequelize: sequelizeMysql,
    modelName: 'zonesCache',
    tableName: 'zones_cache',
  }
);

module.exports = ZonesCache;
