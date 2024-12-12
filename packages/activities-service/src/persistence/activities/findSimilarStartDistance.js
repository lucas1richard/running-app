const { Sequelize } = require('sequelize');
const Activity = require('./model-activities');
const { sequelizeCoordsDistance } = require('../utils');

/**
 * 
Decimal Places	Degrees	Distance
0      	1.0        	   111 km
1      	0.1      	     11.1 km
2      	0.01      	   1.11 km
3      	0.001      	   111 m
4      	0.0001      	 11.1 m
5      	0.00001      	 1.11 m
6      	0.000001       111 mm
7      	0.0000001      11.1 mm
8      	0.00000001     1.11 mm
 */
const startDistConstraint = 0.0008; // about 88.8 meters or 289 feet (88 * 3.28084)
const activityDistanceContstrint = 200; // 200 meters or 656 feet

const findSimilarStartDistance = async (activity) => {
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
            [Sequelize.Op.between]: [ // distance between 300 meters
              activity.distance - activityDistanceContstrint,
              activity.distance + activityDistanceContstrint
            ]
          },
          elapsed_time: {
            [Sequelize.Op.between]: [ // distance between 300 meters
              activity.elapsed_time - 300,
              activity.elapsed_time + 300
            ]
          },
        },
        [Sequelize.Op.not]: {
          id: activity.id // not the same activity
        },
      },
      order: [
        ['start_date_local', 'DESC']
      ]
    },
  )
};

module.exports = findSimilarStartDistance;