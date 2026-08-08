import RelatedActivities from './model-related-activities.js';

const bulkCreateRelatedRoutes = (data) => {
  return RelatedActivities.bulkCreate(
    data,
    {
      // ignoreDuplicates: true,
      updateOnDuplicate: [
        'routeScoreFromRelated', 'routeScoreFromBase', 'longestCommonSegmentSubsequence'
      ],
    }
  )
};

export default bulkCreateRelatedRoutes;
