const { getActivityDetail } = require('../persistence/setupdb-couchbase');

const getActivityDetails = async (activityId) => {
  const detail = await getActivityDetail(activityId);

  return detail;
};

module.exports = {
  getActivityDetails,
};
