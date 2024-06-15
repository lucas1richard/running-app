const { DataTypes, Model } = require('sequelize');
const { sequelizeMysql } = require('../sequelize-mysql');

class AthleteSegment extends Model {
  static async findAllByActivityId(activityId) {
    return AthleteSegment.findAll({
      where: {
        activityId,
      },
      order: [['start_date', 'ASC']],
      attributes: ['activitySegmentId'],
    });
  }
}

AthleteSegment.init(
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
    modelName: 'athlete_segments',
    tableName: 'athlete_segments',
  }
);

module.exports = AthleteSegment;
