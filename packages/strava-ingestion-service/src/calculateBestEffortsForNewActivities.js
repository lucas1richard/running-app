const { calculateActivityBestEfforts } = require('./calculateActivityBestEfforts');
const { getMySQLConnection } = require('./mysql-connection');

/**
 * @param {number[]} activityIds
 */
const calculateBestEffortsForNewActivities = async (activityIds = []) => {
  if (activityIds.length === 0) return;

  const connection = await getMySQLConnection();

  // get pre-existing calculated best efforts for activities within `activityIds` so they can
  // be excluded from re-calculation
  const [calculatedBestEfforts] = await connection.query(`
  SELECT DISTINCT(activityId) AS activityId
  FROM calculated_best_efforts AS calculatedBestEfforts
  WHERE calculatedBestEfforts.activityId IN (?)
  `, [activityIds]);

  console.log('calculatedBestEfforts', calculatedBestEfforts);

  const [activities] = await connection.query(`
    SELECT
      id, start_date_local, sport_type
      FROM activities AS activities
      WHERE (activities.id IN ?)
      AND NOT ((activities.id IN ?))
      AND activities.sport_type = 'Run'
      ORDER BY activities.start_date_local ASC;
  `, [activityIds, calculatedBestEfforts]);

  if (activities.length === 0) {
    console.log('calculateBestEffortsForNewActivities: NO NEW ACTIVITIES FOR WHICH TO CALCULATE BEST EFFORTS')
    return;
  }

  const NUM_RANKS_TO_TRACK = 10;

  const [existingCalculatedBestEfforts] = await connection.query(
    `SELECT * FROM (
      SELECT b.*, a.name as activity_name, ROW_NUMBER() OVER (PARTITION BY b.distance ORDER BY b.elapsed_time ASC) as row_num 
        FROM calculated_best_efforts AS b
        JOIN activities AS a ON activityId = a.id
        WHERE hidden IS NOT TRUE AND a.id NOT IN (:activityIds) AND b.start_date_local < :startDate
    ) subquery
     WHERE row_num <= ${NUM_RANKS_TO_TRACK}`,
    {
      activityIds,
      startDate: activities[0].start_date_local, // Using the earliest activity's start date
    }
  );

  const existingRecords = existingCalculatedBestEfforts.reduce((r, e) => {
    if (!r[e.name]) r[e.name] = [];
    r[e.name].push(e);
    return r;
  });

  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];
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

    await connection.query(`
      INSERT INTO calculated_best_efforts (
      start_date_local,distance,elapsed_time,moving_time,pr_rank,name,start_index,end_index,activityId,createdAt,updatedAt
      )
      VALUES ? ON DUPLICATE KEY UPDATE name=VALUES(name);
    `, [rankedEfforts.map((effort) => [
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
    ])]);
  }
};

module.exports = {
  calculateBestEffortsForNewActivities,
};
