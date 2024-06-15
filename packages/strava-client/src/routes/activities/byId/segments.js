const { Router } = require('express');
const AthleteSegment = require('../../../database/sequelize-athlete-segments');
const { sequelizeCoordsDistance } = require('../../../database/utils');
const Activity = require('../../../database/sequelize-activities');
const RelatedActivities = require('../../../database/sequelize-related-activities');
const longestCommonSubsequence = require('../../../utils/longestCommonSubsequence');

const router = new Router();

router.get('/:id/segments', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const compareToId = req.query?.compareTo;
    const [retrievedSegmentIds, retrievedCompareToSegments] = await Promise.all([
      AthleteSegment.findAll({
        where: { activityId },
        order: [['start_date', 'ASC']],
        attributes: ['activitySegmentId'],
      }),
      compareToId
        ? AthleteSegment.findAll({
          where: {
            activityId: compareToId,
          },
          order: [['start_date', 'ASC']],
          attributes: ['activitySegmentId'],
        })
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
  const activity = await Activity.findOne({ where: { id: activityId } });

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

    const allSegments = await AthleteSegment.findAll({
      order: [['start_date', 'ASC']],
      attributes: ['activityId', 'activitySegmentId'],
      include: [
        {
          model: Activity,
          where: {
            isNearby: sequelizeCoordsDistance(activity.start_latlng, 0.0006, 'start_latlng'),
          },
        }
      ],
    });

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

    await RelatedActivities.bulkCreate(
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

    return comparedSegments;
  };

router.get('/:id/segments/compare', async (req, res) => {
  try {
    const activityId = req.params?.id;
    
    const comparedSegments = await getComparedSegments(activityId);

    res.json(comparedSegments);
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
});

module.exports = {
  segmentsRouter: router,
  getComparedSegments,
};
