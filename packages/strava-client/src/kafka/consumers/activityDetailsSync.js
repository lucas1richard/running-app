const { ACTIVITY_PULL } = require('../topics');

const activityDetailsSync = async (kafkaClient) => {
  const consumer = kafkaClient.consumer({ groupId: 'strava-client' });
  await consumer.connect();
  await consumer.subscribe({ topic: ACTIVITY_PULL, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        topic,
        partition,
        offset: message.offset,
        value:  JSON.parse(message.value),
      })
    },
  });
};

module.exports = {
  activityDetailsSync,
};