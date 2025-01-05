const { Sequelize } = require('sequelize');
const Activity = require('./model-activities');
const { sequelizeCoordsDistance } = require('../utils');
const {
  findSimilarStartDistance: { START_DISTANCE_CONSTRAINT },
} = require('../../constants');

const findBySimilarStart = async (activity, radius = START_DISTANCE_CONSTRAINT) => {
  const sqlPoint = Sequelize.fn('Point', activity.start_latlng[0], activity.start_latlng[1]);
  const sqlCol = Sequelize.col('start_latlng');
  const distFn = Sequelize.fn('ST_Distance', sqlCol, sqlPoint);

  return Activity.scope('').findAll({
    attributes: [
      'name',
      'id',
      'start_date_local',
      [distFn, 'start_distance'],
    ],
    where: {
      [Sequelize.Op.and]: {
        sport_type: activity.sport_type,
        // `ax` doesn't mean anything, just a placeholder
        ax: sequelizeCoordsDistance(activity.start_latlng, radius),
        [Sequelize.Op.not]: {
          id: activity.id, // not the same activity
        },
      },
    },
    order: [[distFn, 'ASC']],
    group: ['id'],
  })
};

module.exports = findBySimilarStart;

