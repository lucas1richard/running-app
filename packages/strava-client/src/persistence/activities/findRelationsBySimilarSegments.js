const { Sequelize, HasOne } = require('sequelize');
const RelatedActivities = require('./model-related-activities');
const Activity = require('./model-activities');

const summedSegmentScores = Sequelize.where(
  Sequelize.col('segmentScoreFromBase'), '+', Sequelize.col('segmentScoreFromRelated')
);

const findRelationsBySimilarSegments = async (baseActivity) => {
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

module.exports = findRelationsBySimilarSegments;
