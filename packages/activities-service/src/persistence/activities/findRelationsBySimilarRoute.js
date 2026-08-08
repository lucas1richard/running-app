import { Sequelize, HasOne } from 'sequelize';
import RelatedActivities from './model-related-activities.js';
import Activity from './model-activities.js';
import { findRelationsBySimilarRoute as constEnum } from '../../constants.js';

const summedRouteScores = Sequelize.where(
  Sequelize.col('routeScoreFromBase'), '+', Sequelize.col('routeScoreFromRelated')
);

const findRelationsBySimilarRoute = async (baseActivityId) => {
  return RelatedActivities.findAll({
    where: {
      linked: Sequelize.where(summedRouteScores, Sequelize.Op.gte, constEnum.SIMILARITY_THRESHOLD),
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

export default findRelationsBySimilarRoute;
