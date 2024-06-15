const { Router } = require('express');
const RelatedActivities = require('../database/sequelize-related-activities');
const Activity = require('../database/sequelize-activities');
const { getComparedRoutes } = require('../controllers/getComparedRoutes');
const { Sequelize, HasOne } = require('sequelize');

const router = new Router();

router.get('/network', async (req, res) => {
  try {
    const allActivities = await Activity.findAll({
      where: {
        sport_type: 'Run',
        start_date: {
          // within the past year
          [Sequelize.Op.gte]: new Date().getTime() - 365 * 24 * 60 * 60 * 1000,
        }
      },
      limit: 200,
    });

    const allActivityIds = allActivities.map((activity) => activity.id);

    await Promise.allSettled(allActivityIds.map(getComparedRoutes));
    // const all = await getComparedRoutes(11631141332);
    // all.map(({ value }, ix) => ({ value, activityId: allActivityIds[ix] }));
    // res.json(network);
    const network = await RelatedActivities.findAll({
      where: {
        linked: Sequelize.where(
          Sequelize.where(
            Sequelize.col('routeScoreFromBase'), '+', Sequelize.col('routeScoreFromRelated')
          ),
          Sequelize.Op.gte,
          1
        ),
      },
      order: [
        [Sequelize.where(
          Sequelize.col('routeScoreFromBase'), '+', Sequelize.col('routeScoreFromRelated')
        ), 'DESC']
      ],
      include: [
        {
          attributes: ['name', 'start_date'],
          association: new HasOne(
            RelatedActivities,
            Activity.scope(''),
            { foreignKey: 'id', sourceKey: 'baseActivity', as: 'fromBaseActivity', }
          ),
        },
        {
          attributes: ['name', 'start_date'],
          association: new HasOne(
            RelatedActivities,
            Activity.scope(''),
            { foreignKey: 'id', sourceKey: 'relatedActivity', as: 'fromRelatedActivity', }
          ),
        },
      ]
    });

    return res.json(network)
  } catch (err) {
    console.log(err)
    res.status(500).send(err.message);
  }
});

module.exports = {
  activityRoutesRouter: router,
};
