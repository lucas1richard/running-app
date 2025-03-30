const { consumeFromFanout } = require('../consumer');

const listListener = async () => {
  return consumeFromFanout('Hello', '', async (message) => {
    console.log({
      message,
    });
  });
};

module.exports = {
  listListener,
};