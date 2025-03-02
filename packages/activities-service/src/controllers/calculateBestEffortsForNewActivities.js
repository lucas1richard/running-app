const { Op, Sequelize } = require('sequelize');
const Activity = require('../persistence/activities/model-activities');
const CalculatedBestEfforts = require('../persistence/activities/model-calculated-efforts');
const { calculateActivityBestEfforts } = require('./calculateActivityBestEfforts');

/**
 * @param {number[]} activityIds
 */
const calculateBestEffortsForNewActivities = async (activityIds = []) => {
  if (activityIds.length === 0) return;

  // get pre-existing calculated best efforts for activities within `activityIds` so they can
  // be excluded from re-calculation
  const calculatedBestEfforts = await CalculatedBestEfforts.findAll({
    where: {
      [Op.or]: activityIds.map((activityId) => ({ activityId })),
    },
    attributes: [
      [Sequelize.fn('DISTINCT', Sequelize.col('activityId')), 'activityId']
    ],
    distinct: true,
  });

  const activities = await Activity.findAll({
    where: {
      [Op.or]: activityIds.map((id) => ({ id })),
      [Op.not]: {
        [Op.or]: calculatedBestEfforts.map(({ activityId }) => ({ id: activityId }))
      }
    },
    order: [['start_date_local', 'asc']],
  });

  if (activities.length === 0) {
    console.log('calculateBestEffortsForNewActivities: NO NEW ACTIVITIES FOR WHICH TO CALCULATE BEST EFFORTS')
    return;
  }

  const existingCalculatedBestEfforts = await CalculatedBestEfforts.sequelize.query(
    `SELECT * FROM (
      SELECT b.*, a.name as activity_name, ROW_NUMBER() OVER (PARTITION BY b.distance ORDER BY b.elapsed_time ASC) as row_num 
        FROM ${CalculatedBestEfforts.tableName} AS b
        JOIN ${Activity.tableName} AS a ON activityId = a.id
        WHERE hidden IS NOT TRUE AND a.id NOT IN (:activityIds) AND b.start_date_local < :startDate
    ) subquery
     WHERE row_num <= ${CalculatedBestEfforts.NUM_RANKS_TO_TRACK}`,
    {
      replacements: {
        activityIds,
        startDate: activities[0].start_date_local, // Using the earliest activity's start date
      },
      model: CalculatedBestEfforts,
      mapToModel: true,
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

    await CalculatedBestEfforts.bulkCreate(rankedEfforts, {
      updateOnDuplicate: ['name'],
    });
  }
};

module.exports = {
  calculateBestEffortsForNewActivities,
};
