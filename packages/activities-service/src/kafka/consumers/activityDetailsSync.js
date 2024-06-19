const { bulkCreateActivitySegments, bulkCreateAthleteSegments } = require('../../persistence/segments');
const { getActivityDetail } = require('../../persistence/setupdb-couchbase');
const { ACTIVITY_PULL } = require('../topics');

const syncActivityDetails = async (activityId) => {
  const details = await getActivityDetail(activityId);

  const segmentEfforts = details?.segment_efforts || [];
  try {
    await bulkCreateAthleteSegments(activityId, segmentEfforts);
    console.log('Athlete segments added');
    console.log('Now adding activity segments');
    await bulkCreateActivitySegments(activityId, segmentEfforts);
  } catch (err) {
    console.error(err);
  }
  // add to the database
  // add to the join table for activity and segment
};

const activityDetailsSync = async (kafkaClient) => {
  const consumer = kafkaClient.consumer({ groupId: 'strava-client' });
  await consumer.connect();
  await consumer.subscribe({ topic: ACTIVITY_PULL, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = JSON.parse(message.value);
      console.log({
        topic,
        partition,
        offset: message.offset,
        value,
      });
      await syncActivityDetails(value.id);
    },
  });

  // add segments to database
  // add to the join table for activity and segment
};

module.exports = {
  activityDetailsSync,
};