// find by similar route
// - distance
// - start location
// - max/min values
//  - altitude
//  - 
//  - lat,long

const Router = require('express').Router;
const Sequelize = require('sequelize');
const Activity = require('../../database/sequelize-activities');

const router = new Router();

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
const startDistConstraint = 0.0002; // about 22 meters or 72 feet (22 * 3.28084)
const activityDistanceContstrint = 300; // 300 meters or 984 feet

router.post('/by-route', async (req, res) => {
  try {
    const { body } = req;
    const id = body?.id;

    const activity = await Activity.findOne({ where: { id } });

    if (!id) {
      return res.json({ activity_not_found: true });
    }

    const combo = await Activity.findAll(
      {
        where: {
          [Sequelize.Op.and]: {
            sport_type: 'Run',
            ax: Sequelize.where( // `ax` doesn't mean anything, just a placeholder
              Sequelize.fn( // Geometric distance between two points
                'ST_Distance',
                Sequelize.col('start_latlng'),
                Sequelize.fn('Point', activity.start_latlng[0], activity.start_latlng[1])
              ),
              Sequelize.Op.lte,
              startDistConstraint
            ),
            distance: {
              [Sequelize.Op.between]: [ // distance between 300 meters
                activity.distance - activityDistanceContstrint,
                activity.distance + activityDistanceContstrint
              ]
            },
          },
          [Sequelize.Op.not]: {
            id // not the same activity
          },
        },
      },
    );

    res.json({ combo });

  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = {
  similarWorkoutsRouter: router,
};
