const { getActivityDetail, addActivityDetail } = require('../persistence/setupdb-couchbase');
const fetchStrava = require('../utils/fetchStrava');
const addBestEffortsForActivity = require('../persistence/activities/addBestEffortsForActivity');

const getActivityDetails = async (activityId) => {
  const detail = await getActivityDetail(activityId);
  await addBestEffortsForActivity(activityId, detail?.best_efforts || []);

  if (detail) return detail;

  const activitiy = await fetchStrava(`/activities/${activityId}`);
  await addActivityDetail(activitiy);

  return activitiy;
};

module.exports = {
  getActivityDetails,
};
