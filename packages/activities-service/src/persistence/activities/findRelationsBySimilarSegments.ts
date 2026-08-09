import { Sequelize, HasOne } from 'sequelize';
import RelatedActivities from './model-related-activities.ts';
import Activity from './model-activities.ts';
import { type PersistenceActivity } from './acitivities.types.ts';

const summedSegmentScores = Sequelize.where(
  Sequelize.col('segmentScoreFromBase'), '+', Sequelize.col('segmentScoreFromRelated')
);

const findRelationsBySimilarSegments = async (baseActivity?: PersistenceActivity) => {
  return RelatedActivities.findAll({
    where: {
      linked: Sequelize.where(summedSegmentScores, Sequelize.Op.gte, 1),
      baseActivity,
    },
    order: [
      [summedSegmentScores, 'DESC']
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
};

export default findRelationsBySimilarSegments;
