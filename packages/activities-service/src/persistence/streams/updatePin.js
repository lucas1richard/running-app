const StreamPin = require('./model-stream-pins');

const updatePin = async (activityId, pin) => {
  return StreamPin.update(pin, {
    where: {
      activityId,
      id: pin.id,
    },
  });
};

module.exports = updatePin;
