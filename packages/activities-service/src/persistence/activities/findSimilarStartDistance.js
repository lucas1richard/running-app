const { Sequelize } = require('sequelize');
const Activity = require('./model-activities');
const { sequelizeCoordsDistance } = require('../utils');
const RelatedActivities = require('./model-related-activities');

/**
 * 
*/
/**
 * ## about 55.5 meters or 182 feet (55.5 * 3.28084)
 * 
 *  Decimal | Places	       | Degrees	Distance
 *  :-------|:---------------|:----------------:
 *  0      	| 1.0        	   | 111 km
 *  1      	| 0.1      	     | 11.1 km
 *  2      	| 0.01      	   | 1.11 km
 *  3      	| 0.001      	   | 111 m
 *  4      	| 0.0001      	 | 11.1 m
 *  5      	| 0.00001      	 | 1.11 m
 *  6      	| 0.000001       | 111 mm
 *  7      	| 0.0000001      | 11.1 mm
 *  8      	| 0.00000001     | 1.11 mm
 */
const startDistConstraint = 0.0005;
/** ## 200 meters or 656 feet */
const activityDistanceContstrint = 200;

const findSimilarStartDistance = async (activity, maxCount = 100, excludeAlreadyRelated = false) => {
  return Activity.findAll(
    {
      where: {
        [Sequelize.Op.and]: {
          sport_type: activity.sport_type,
          ax: sequelizeCoordsDistance( // `ax` doesn't mean anything, just a placeholder
            activity.start_latlng,
            startDistConstraint,
            'start_latlng'
          ),
          dx: sequelizeCoordsDistance( // `dx` doesn't mean anything, just a placeholder
            activity.start_latlng,
            startDistConstraint,
            'end_latlng'
          ),
          distance: {
            [Sequelize.Op.between]: [
              activity.distance - activityDistanceContstrint,
              activity.distance + activityDistanceContstrint
            ]
          },
          elapsed_time: {
            [Sequelize.Op.between]: [
              activity.elapsed_time - 300,
              activity.elapsed_time + 300
            ]
          },
        },
        [Sequelize.Op.not]: {
          id: activity.id // not the same activity
        },
        ...excludeAlreadyRelated ? {
          [Sequelize.Op.not]: Sequelize.literal(`
          EXISTS
            (SELECT 1 FROM ${RelatedActivities.tableName} as RelatedActivities
            WHERE RelatedActivities.baseActivity = ${activity.id}
            AND RelatedActivities.relatedActivity = ${Activity.tableName}.id
          )`)
        } : {},
      },
      order: [
        ['start_date_local', 'DESC']
      ],
      limit: maxCount,
    },
  )
};

module.exports = findSimilarStartDistance;