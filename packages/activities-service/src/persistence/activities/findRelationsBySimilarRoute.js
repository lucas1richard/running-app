const { Sequelize, HasOne } = require('sequelize');
const RelatedActivities = require('./model-related-activities');
const Activity = require('./model-activities');

const summedRouteScores = Sequelize.where(
  Sequelize.col('routeScoreFromBase'), '+', Sequelize.col('routeScoreFromRelated')
);

const findRelationsBySimilarRoute = async (baseActivityId) => {
  return RelatedActivities.findAll({
    where: {
      linked: Sequelize.where(summedRouteScores, Sequelize.Op.gte, 1),
      baseActivity: baseActivityId,
    },
    order: [
      [summedRouteScores, 'DESC']
    ],
    include: [
      // {
      //   // attributes: ['name', 'start_date'],
      //   association: new HasOne(
      //     RelatedActivities,
      //     Activity.scope(''),
      //     { foreignKey: 'id', sourceKey: 'baseActivity', as: 'baseActivityDetails', }
      //   ),
      // },
      {
        // attributes: ['name', 'start_date'],
        association: new HasOne(
          RelatedActivities,
          Activity.scope(''),
          { foreignKey: 'id', sourceKey: 'relatedActivity', as: 'relatedActivityDetails', }
        ),
      },
    ]
  });
};

module.exports = findRelationsBySimilarRoute;
