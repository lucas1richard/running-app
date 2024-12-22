const StreamPin = require('./model-stream-pins');

const getStreamPins = async (activityId) => {
  return StreamPin.findAll({
    where: {
      activityId,
    },
    order: [
      ['index', 'ASC'],
    ],
  });
};

module.exports = getStreamPins;
