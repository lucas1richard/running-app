import RelatedActivities from './model-related-activities.ts';

const bulkCreateRelatedSegments = async (activityId, comparedSegments) => {
  return RelatedActivities.bulkCreate(
    comparedSegments.filter(({ baseActivity }) => baseActivity !== activityId).map((segment) => ({
      baseActivity: activityId,
      relatedActivity: segment.id,
      segmentScoreFromBase: segment.longestCommonSubsequence / segment.activitySegmentsIdsLength,
      segmentScoreFromRelated: segment.longestCommonSubsequence / segment.compareSegmentsIdsLength,
      longestCommonSegmentSubsequence: segment.longestCommonSubsequence,
      numberBaseSegments: segment.activitySegmentsIdsLength,
      numberRelatedSegments: segment.compareSegmentsIdsLength,
    })),
    {
      updateOnDuplicate: [
        'segmentScoreFromBase',
        'segmentScoreFromRelated',
        'longestCommonSegmentSubsequence',
        'numberBaseSegments',
        'numberRelatedSegments',
      ],
    }
  );
};

export default bulkCreateRelatedSegments;
