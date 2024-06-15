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
const startDistConstraint = 0.0003; // about 22 meters or 72 feet (22 * 3.28084)
const activityDistanceContstrint = 500; // 300 meters or 984 feet

const findSimilarStartDistance = async (activity) => {
  return Activity.findAll(
    {
      where: {
        [Sequelize.Op.and]: {
          sport_type: 'Run',
          ax: sequelizeCoordsDistance( // `ax` doesn't mean anything, just a placeholder
            activity.start_latlng,
            startDistConstraint,
            'start_latlng'
          ), 
          distance: {
            [Sequelize.Op.between]: [ // distance between 300 meters
              activity.distance - activityDistanceContstrint,
              activity.distance + activityDistanceContstrint
            ]
          },
        },
        [Sequelize.Op.not]: {
          id: activity.id // not the same activity
        },
      },
    },
  )
};

module.exports = findSimilarStartDistance;