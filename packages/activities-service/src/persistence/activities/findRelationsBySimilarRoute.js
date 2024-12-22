const { Sequelize, HasOne } = require('sequelize');
const RelatedActivities = require('./model-related-activities');
const Activity = require('./model-activities');

/**
 * This is somewhat arbitrary, but it's a threshold for how similar two routes need to be to be considered related.
 * The route score is a sum of the route scores from the base activity to the related activity and vice versa.
 * The route score is calculated by comparing the route coordinates of the two activities.
 * The route score is a number between 0 and 1, where 0 means the routes are completely different and 1 means the routes are identical.
 */
const SIMILARITY_THRESHOLD = 1;

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
