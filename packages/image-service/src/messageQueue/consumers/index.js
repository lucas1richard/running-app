const { listListener } = require('./listListener');

const setupConsumers = async () => {
  console.log('SETTING UP MESSAGE_QUEUE CONSUMERS');
  const res = await Promise.allSettled([
    listListener(),
  ]);
};

module.exports = {
  setupConsumers,
};
