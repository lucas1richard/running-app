const BestEfforts = require('./model-best-efforts');

const addBestEffortsForActivity = async (activityId, bestEfforts) => {
  return BestEfforts.bulkCreate(bestEfforts.filter(({ pr_rank }) => !!pr_rank).map((effort) => ({
    ...effort,
    activity_id: activityId,
    effort_id: effort.id,
    activityId,
  })), {
    updateOnDuplicate: ['start_date_local', 'distance', 'duration', 'pr_rank', 'name', 'start_index', 'end_index'],
  });
};

module.exports = addBestEffortsForActivity;
