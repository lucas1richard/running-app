const { Router } = require('express');
const AthleteSegment = require('../../../database/sequelize-athlete-segments');
const { sequelizeCoordsDistance } = require('../../../database/utils');
const Activity = require('../../../database/sequelize-activities');

const router = new Router();

const longestCommonSubsequence = (seq1, seq2) => {
  const sym = Symbol('x');
  const memo = Array.apply(null, new Array(seq1.length)).map(() => new Array(seq2.length).fill(sym));

  const recurse = (i, j) => {
    if (i >= seq1.length || j >= seq2.length) return 0;
    
    if (memo[i][j] === sym) {
      if (seq1[i] === seq2[j]) memo[i][j] = 1 + recurse(i + 1, j + 1);
      else memo[i][j] = Math.max(recurse(i + 1, j), recurse(i, j + 1));
    }
    
    return memo[i][j];
  };
  
  return recurse(0, 0);
};

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
    res.json({
      longestCommonSubsequence: longestCommonSubsequence(activitySegmentsIds, compareSegmentsIds),
      activitySegmentsIdsLength: activitySegmentsIds.length,
      compareSegmentsIdsLength: compareSegmentsIds.length,
      activitySegmentsIds,
      compareSegmentsIds,
    });
  } catch (err) {
    res.status(500).send(err.message)
  }
});

router.get('/:id/segments/compare', async (req, res) => {
  try {
    const activityId = req.params?.id;
    const activity = await Activity.findOne({ where: { id: activityId } });

    if (!activity) {
      return res.json({ activity_not_found: true });
    }
    
    const allSegments = await AthleteSegment.findAll({
      order: [['start_date', 'ASC']],
      attributes: ['activityId', 'activitySegmentId'],
      include: [
        {
          model: Activity,
          where: {
            isNearby: sequelizeCoordsDistance(activity.start_latlng, 0.0003, 'start_latlng'),
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
    
    res.json(comparedSegments);
  } catch (err) {
    res.status(500).send(err.message)
  }
});

module.exports = {
  segmentsRouter: router,
};
