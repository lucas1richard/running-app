import RelatedActivities from './model-related-activities.ts';

const bulkCreateRelatedRoutes = (data) => {
  return RelatedActivities.bulkCreate(
    data,
    {
      // ignoreDuplicates: true,
      updateOnDuplicate: [
        'routeScoreFromRelated', 'routeScoreFromBase', 'longestCommonSegmentSubsequence'
      ],
    }
  );
};

export default bulkCreateRelatedRoutes;
