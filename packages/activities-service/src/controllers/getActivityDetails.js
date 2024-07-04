const { getActivityDetail, addActivityDetail } = require('../persistence/setupdb-couchbase');
const { producer } = require('../kafka/client');
const { ACTIVITY_PULL } = require('../kafka/topics');
const fetchStrava = require('../utils/fetchStrava');

const getActivityDetails = async (activityId) => {
  const detail = await getActivityDetail(activityId);
  await producer.connect();
  if (detail) {
    return detail;
  }

  const activitiy = await fetchStrava(`/activities/${activityId}`);
  await addActivityDetail(activitiy);
  await producer.send({ // process the activity some more off-cycle
    topic: ACTIVITY_PULL,
    messages: [
      { value: JSON.stringify({ id: activitiy.id }) }
    ],
  });

  return activitiy;
};

module.exports = {
  getActivityDetails,
};
