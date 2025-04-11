const { calculateActivityBestEfforts } = require('./calculateActivityBestEfforts');
const { query } = require('./mysql-connection');
const {
  selectExistingBestEffortActivityIdsSql,
  selectActivitiesWithoutBestEffortsSql,
  selectMostRecentBestEffortsSql,
  insertBestEffortsSql,
} = require('./sql-queries');

/**
 * @param {number[]} activityIds
 */
const calculateBestEffortsForNewActivities = async (activityIds = []) => {
  if (activityIds.length === 0) return;

  // get pre-existing calculated best efforts for activities within `activityIds` so they can
  // be excluded from re-calculation
  const calculatedBestEffortActivityIds = await query(
    selectExistingBestEffortActivityIdsSql,
    [activityIds]
  );

  const activitiesWithoutBestEfforts = await query(
    selectActivitiesWithoutBestEffortsSql,
    [activityIds, calculatedBestEffortActivityIds]
  );

  if (activitiesWithoutBestEfforts.length === 0) {
    console.trace('calculateBestEffortsForNewActivities: NO NEW ACTIVITIES FOR WHICH TO CALCULATE BEST EFFORTS')
    return;
  }

  const NUM_RANKS_TO_TRACK = 10;

  const existingCalculatedBestEfforts = await query(
    selectMostRecentBestEffortsSql,
    [
      activityIds,
      activitiesWithoutBestEfforts[0].start_date_local, // Using the earliest activity's start date
      NUM_RANKS_TO_TRACK,
    ]
  );

  const existingRecords = existingCalculatedBestEfforts.reduce((r, e) => {
    if (!r[e.name]) r[e.name] = [];
    r[e.name].push(e);
    return r;
  });

  for (let i = 0; i < activitiesWithoutBestEfforts.length; i++) {
    const activity = activitiesWithoutBestEfforts[i];
    const efforts = await calculateActivityBestEfforts(activity.id);

    const rankedEfforts = efforts.map((e) => {
      const effort = {
        start_date_local: activity.start_date_local,
        activityId: activity.id,
        name: e.name,
        distance: e.distance,
        elapsed_time: e.time,
        moving_time: e.time,
        pr_rank: null,
        start_index: e.start,
        end_index: e.end,
      };
      const ranks = existingRecords[effort.name] || [];
      const highestRankIndex = ranks.findIndex((v) => !v || v.elapsed_time > effort.elapsed_time);
      if (highestRankIndex > -1) {
        // since ranks is a pointer, this updates `existingRecords`, which keeps it accurate for
        // subsequent activities (no need to sql query to get refreshed `existingRecords`)
        ranks[highestRankIndex] = effort;
        effort.pr_rank = highestRankIndex + 1;
      }

      return effort;
    });

    await query(insertBestEffortsSql, [
      rankedEfforts.map((effort) => [
        effort.start_date_local,
        effort.distance,
        effort.elapsed_time,
        effort.moving_time,
        effort.pr_rank,
        effort.name,
        effort.start_index,
        effort.end_index,
        effort.activityId,
        new Date(),
        new Date(),
      ])
    ]);
  }
};

module.exports = {
  calculateBestEffortsForNewActivities,
};
