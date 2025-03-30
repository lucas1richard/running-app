const { consumeFromFanout } = require('../consumer');
const topics = require('../topics');

const listListener = async () => {
  consumeFromFanout(topics.ACTIVITIES_FETCHED, '', async (message) => {
    const value = JSON.parse(message);
    console.log({
      offset: message.offset,
      value,
    });
  });
};

module.exports = {
  listListener,
};