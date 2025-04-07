const { Sequelize, HasOne } = require('sequelize');
const RelatedActivities = require('./model-related-activities');
const Activity = require('./model-activities');
const { findRelationsBySimilarRoute: { SIMILARITY_THRESHOLD } } = require('../../constants');

const summedRouteScores = Sequelize.where(
  Sequelize.col('routeScoreFromBase'), '+', Sequelize.col('routeScoreFromRelated')
);

const findRelationsBySimilarRoute = async (baseActivityId) => {
  return RelatedActivities.findAll({
    where: {
      linked: Sequelize.where(summedRouteScores, Sequelize.Op.gte, SIMILARITY_THRESHOLD),
      baseActivity: baseActivityId,
      [Sequelize.Op.not]: { relatedActivity: baseActivityId },
    },
    order: [
      [{ target: Activity, as: 'relatedActivityDetails' }, 'start_date', 'DESC']
    ],
    include: [
      {
        attributes: ['id', 'name', 'start_date'],
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
