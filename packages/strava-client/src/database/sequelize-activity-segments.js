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
    elapsed_time: {
      type: DataTypes.INTEGER,
    },
    moving_time: {
      type: DataTypes.INTEGER,
    },
    start_date: {
      type: DataTypes.DATE,
    },
    start_date_local: {
      type: DataTypes.DATE,
    },
    distance: {
      type: DataTypes.DECIMAL(7, 2),
      get() { return Number(this.getDataValue('distance')); },
    },
    start_index: {
      type: DataTypes.INTEGER,
    },
    end_index: {
      type: DataTypes.INTEGER,
    },
    device_watts: {
      type: DataTypes.BOOLEAN,
    },
    average_heartrate: {
      type: DataTypes.DECIMAL(4, 1),
      get() { return Number(this.getDataValue('average_heartrate')); },
    },
    max_heartrate: {
      type: DataTypes.DECIMAL(4, 1),
      get() { return Number(this.getDataValue('max_heartrate')); },
    },
  },
  {
    sequelize: sequelizeMysql,
    modelName: 'activity_segments',
    tableName: 'activity_segments',
  }
);

module.exports = ActivitySegment;
