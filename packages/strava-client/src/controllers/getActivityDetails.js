const { getActivityDetail, addActivityDetail } = require('../database/setupdb-couchbase');
const { producer } = require('../kafka/client');
const { ACTIVITY_PULL } = require('../kafka/topics');
const fetchStrava = require('../utils/fetchStrava');

const getActivityDetails = async (activityId) => {
  const detail = await getActivityDetail(activityId);
  await producer.connect();
  if (detail) {
    await producer.send({
      topic: ACTIVITY_PULL,
      messages: [
        { value: JSON.stringify({ id: activityId }) }
      ],
    });
    return detail;
  }

  const activitiy = await fetchStrava(`/activities/${activityId}`);
  await addActivityDetail(activitiy);
  await producer.send({
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