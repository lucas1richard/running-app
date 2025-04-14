const { imageDownloadListener } = require('./imageDownloadListener');
const { listListener } = require('./listListener');

const setupConsumers = async () => {
  console.trace('SETTING UP MESSAGE_QUEUE CONSUMERS');
  const res = await Promise.allSettled([
    // listListener(),
    imageDownloadListener(),
  ]);
};

module.exports = {
  setupConsumers,
};
