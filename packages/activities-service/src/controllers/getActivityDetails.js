const { getActivityDetail, addActivityDetail } = require('../persistence/setupdb-couchbase');
const fetchStrava = require('../utils/fetchStrava');
const addBestEffortsForActivity = require('../persistence/activities/addBestEffortsForActivity');
const CalculatedBestEfforts = require('../persistence/activities/model-calculated-efforts');

const getActivityDetails = async (activityId) => {
  const detail = await getActivityDetail(activityId);
  const best_efforts = await CalculatedBestEfforts.findAll({ where: { activityId } });
  await addBestEffortsForActivity(activityId, detail?.best_efforts || []);

  if (detail) return {
    ...detail,
    best_efforts,
  };

  const activitiy = await fetchStrava(`/activities/${activityId}`);
  await addActivityDetail(activitiy);

  return activitiy;
};

module.exports = {
  getActivityDetails,
};
