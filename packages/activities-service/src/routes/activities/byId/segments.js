const { Router } = require('express');
const longestCommonSubsequence = require('../../../utils/longestCommonSubsequence');
const {
  findAthleteSegmentsByActivityId,
  findNearbySegmentsWithActivity,
} = require('../../../persistence/segments');
const { findActivityById, bulkCreateRelatedSegments } = require('../../../persistence/activities');

const router = new Router();

router.get('/:id/segments', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const compareToId = req.query?.compareTo;
    const [retrievedSegmentIds, retrievedCompareToSegments] = await Promise.all([
      findAthleteSegmentsByActivityId(activityId),
      compareToId
        ? findAthleteSegmentsByActivityId(compareToId)
        : Promise.resolve([]),
    ]);
    const activitySegmentsIds = retrievedSegmentIds.map((segment) => segment.activitySegmentId);
    const compareSegmentsIds = retrievedCompareToSegments.map((segment) => segment.activitySegmentId);
    return res.json({
      longestCommonSubsequence: longestCommonSubsequence(activitySegmentsIds, compareSegmentsIds),
      activitySegmentsIdsLength: activitySegmentsIds.length,
      compareSegmentsIdsLength: compareSegmentsIds.length,
      activitySegmentsIds,
      compareSegmentsIds,
    });
  } catch (err) {
    return res.status(500).send(err.message)
  }
});

const getComparedSegments = async (activityId) => {
  const activity = await findActivityById(activityId);

    if (!activity) {
      throw Error('Activity not found');
    }

    // const existingRelatedActivities = await RelatedActivities.findAll({
    //   where: {
    //     baseActivity: activityId
    //   },
    //   order: [['segmentScoreFromBase', 'DESC']],
    // });

    // const existingMap = existingRelatedActivities.reduce((acc, { relatedActivity }) => {
    //   acc[relatedActivity] = true;
    //   return acc;
    // }, {});

    const allSegments = await findNearbySegmentsWithActivity(activity.start_latlng);

    const groupedSegments = allSegments.reduce((acc, segment) => {
      const key = segment.activityId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(segment.activitySegmentId);
      return acc;
    }, {});

    const refSegments = groupedSegments[activityId];

    const comparedSegments = Object.entries(groupedSegments)
      .map(([id, compareSegmentsIds]) => {
        const lcs = longestCommonSubsequence(refSegments, compareSegmentsIds);
        return {
          id,
          longestCommonSubsequence: lcs,
          activitySegmentsIdsLength: refSegments.length,
          compareSegmentsIdsLength: compareSegmentsIds.length,
          scoreLow: Number((lcs / Math.max(refSegments.length, compareSegmentsIds.length)).toFixed(2)),
          scoreHigh: Number((lcs / Math.min(refSegments.length, compareSegmentsIds.length)).toFixed(2)),
        }
      });

    comparedSegments.sort((a, b) => b.scoreLow - a.scoreLow);

    await bulkCreateRelatedSegments(activityId, comparedSegments);

    return comparedSegments;
  };

router.get('/:id/segments/compare', async (req, res) => {
  try {
    const activityId = req.params?.id;

    const comparedSegments = await getComparedSegments(activityId);

    res.json(comparedSegments);
  } catch (err) {
    console.trace(err)
    res.status(500).send(err)
  }
});

module.exports = {
  segmentsRouter: router,
  getComparedSegments,
};
