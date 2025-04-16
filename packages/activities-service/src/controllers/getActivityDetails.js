const { getActivityDetail } = require('../persistence/setupdb-couchbase');
const addBestEffortsForActivity = require('../persistence/activities/addBestEffortsForActivity');
const CalculatedBestEfforts = require('../persistence/activities/model-calculated-efforts');
const receiver = require('../messageQueue/receiver');

const getActivityDetails = async (activityId) => {
  const detail = await getActivityDetail(activityId);
  const best_efforts = await CalculatedBestEfforts.findAll({ where: { activityId } });

  if (detail) {
    await addBestEffortsForActivity(activityId, detail?.best_efforts || []);
    return { ...detail, best_efforts };
  }
  await receiver.sendAndAwaitMessage('stravaIngestionService', 'details', activityId);

  const addedDetail = await getActivityDetail(activityId);
  const calc_best_efforts = await CalculatedBestEfforts.findAll({ where: { activityId } });
  if (addedDetail) {
    await addBestEffortsForActivity(activityId, addedDetail?.best_efforts || []);
    return { ...addedDetail, best_efforts: calc_best_efforts };
  }
};

module.exports = {
  getActivityDetails,
};
