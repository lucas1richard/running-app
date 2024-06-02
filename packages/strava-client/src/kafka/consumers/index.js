const { activityDetailsSync } = require('./activityDetailsSync');

const setupKafkaConsumers = async (kafkaClient) => {
  console.log('SETTING UP KAFKA CONSUMERS');
  await Promise.allSettled([
    activityDetailsSync(kafkaClient),
  ]);
};

module.exports = {
  setupKafkaConsumers,
};
