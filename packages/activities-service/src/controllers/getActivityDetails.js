const { getActivityDetail } = require('../persistence/setupdb-couchbase');
const CalculatedBestEfforts = require('../persistence/activities/model-calculated-efforts');
const receiver = require('../messageQueue/receiver');

const getActivityDetails = async (activityId) => {
  const detail = await getActivityDetail(activityId);

  if (detail) {
    const best_efforts = await CalculatedBestEfforts.findAll({ where: { activityId } });
    return { ...detail, best_efforts };
  }
  await receiver.sendAndAwaitMessage('stravaIngestionService', 'details', activityId);

  const addedDetail = await getActivityDetail(activityId);
  const calc_best_efforts = await CalculatedBestEfforts.findAll({ where: { activityId } });
  if (addedDetail) {
    return { ...addedDetail, best_efforts: calc_best_efforts };
  }
};

module.exports = {
  getActivityDetails,
};
