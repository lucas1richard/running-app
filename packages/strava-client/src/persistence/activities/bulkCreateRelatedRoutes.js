const RelatedActivities = require('./model-related-activities');

const bulkCreateRelatedRoutes = (data) => {
  return RelatedActivities.bulkCreate(
    data,
    {
      // ignoreDuplicates: true,
      updateOnDuplicate: ['routeScoreFromRelated', 'routeScoreFromBase'],
    }
  )
};

module.exports = bulkCreateRelatedRoutes;
