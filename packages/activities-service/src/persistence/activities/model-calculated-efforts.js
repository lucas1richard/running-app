const { DataTypes, Model } = require('sequelize');
const { sequelizeMysql } = require('../sequelize-mysql');
const { calculateActivityBestEfforts } = require('../../controllers/calculateActivityBestEfforts');
const Activity = require('./model-activities');

class CalculatedBestEfforts extends Model {
  /**
   * Seeds the database with calculated efforts from activities.
   *
   * This method:
   * 1. Synchronizes the model with the database, dropping existing tables
   * 2. Retrieves all activities sorted by start date
   * 3. Calculates best efforts for each activity
   * 4. Organizes efforts by name (distance category)
   * 5. Assigns PR (personal record) ranks to efforts
   * 6. Bulk creates all calculated efforts in the database
   */
  static async seedDatabase() {
    await this.sync({ force: true });
    const activities = await Activity.findAll({
      where: {
        sport_type: 'Run',
      },
      order: [
        ['start_date_local', 'asc'],
      ],
    });
    const calculated = await Promise.allSettled(activities.map(async (activity) => {
      const efforts = await calculateActivityBestEfforts(activity.id);
      return {
        id: activity.id,
        start_date_local: activity.start_date_local,
        efforts,
      }
    }));
    const records = {};
    calculated.filter(({ status }) => status === 'fulfilled').forEach(({ value }) => {
      value.efforts.forEach((e) => {
        const name = e.name;
        if (!records[name]) records[name] = [];
        records[name].push({
          start_date_local: value.start_date_local,
          activityId: value.id,
          name: e.name,
          distance: e.distance,
          elapsed_time: e.time,
          moving_time: e.time,
          pr_rank: null,
          start_index: e.start,
          end_index: e.end,
        });
      });
    });
    // this relies on the activities being in date order
    Object.values(records).forEach((r) => {
      const ranks = Array(this.NUM_RANKS_TO_TRACK).fill(undefined);
      r = r.map(effort => {
        const highestRankIndex = ranks.findIndex((v) => !v || v.elapsed_time > effort.elapsed_time);
        if (highestRankIndex > -1) {
          ranks[highestRankIndex] = effort;
          effort.pr_rank = highestRankIndex + 1;
        }
      });
      return r;
    });
    await this.bulkCreate(Object.values(records).flat());
  }
}

CalculatedBestEfforts.NUM_RANKS_TO_TRACK = 10;

CalculatedBestEfforts.init(
  {
    start_date_local: {
      type: DataTypes.DATE
    },
    distance: {
      type: DataTypes.FLOAT
    },
    elapsed_time: {
      type: DataTypes.INTEGER
    },
    moving_time: {
      type: DataTypes.INTEGER
    },
    pr_rank: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    start_index: {
      type: DataTypes.INTEGER
    },
    end_index: {
      type: DataTypes.INTEGER
    },
    activityId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
  },
  {
    sequelize: sequelizeMysql,
    modelName: 'calculatedBestEfforts',
    tableName: 'calculated_best_efforts',
  }
);

module.exports = CalculatedBestEfforts;
