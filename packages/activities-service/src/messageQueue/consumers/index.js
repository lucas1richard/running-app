const { activityDetailsSync } = require('./activityDetailsSync');
const { listListener } = require('./listListener');

const setupConsumers = async () => {
  console.log('SETTING UP MESSAGE_QUEUE CONSUMERS');
  await Promise.allSettled([
    activityDetailsSync(),
    listListener,
  ]);
};

module.exports = {
  setupConsumers,
};
