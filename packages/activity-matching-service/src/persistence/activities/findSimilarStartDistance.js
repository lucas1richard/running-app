const { Sequelize, Op } = require('sequelize');
const Activity = require('./model-activities');
const { sequelizeCoordsDistance } = require('../utils');
const RelatedActivities = require('./model-related-activities');
const {
  findSimilarStartDistance: { START_DISTANCE_CONSTRAINT, ACTIVITY_DISTANCE_CONSTRAINT },
} = require('../../constants');

const findSimilarStartDistance = async (activity, maxCount = 100, excludeAlreadyRelated = false) => {
  const distanceDelta = Math.max(activity.distance * 0.1, ACTIVITY_DISTANCE_CONSTRAINT);
  const timeDelta = Math.max(activity.elapsed_time * 0.1, 300);
  return Activity.findAll(
    {
      where: {
        [Op.and]: {
          sport_type: activity.sport_type,
          ax: sequelizeCoordsDistance( // `ax` doesn't mean anything, just a placeholder
            activity.start_latlng,
            START_DISTANCE_CONSTRAINT,
            'start_latlng'
          ),
          distance: {
            [Op.between]: [
              activity.distance - distanceDelta,
              activity.distance + distanceDelta
            ]
          },
          elapsed_time: {
            [Op.between]: [
              activity.elapsed_time - timeDelta,
              activity.elapsed_time + timeDelta
            ]
          },
        },
        [Op.not]: {
          id: activity.id, // not the same activity
          ...excludeAlreadyRelated ? {
            alreadyRelated: Sequelize.literal(`
            NOT EXISTS
              (SELECT 1 FROM ${RelatedActivities.tableName} as RelatedActivities
              WHERE RelatedActivities.baseActivity = ${activity.id}
              AND RelatedActivities.relatedActivity = ${Activity.tableName}.id
            )`)
          } : {},
        },
      },
      order: [
        ['start_date_local', 'DESC']
      ],
      limit: maxCount,
    },
  )
};

module.exports = findSimilarStartDistance;
