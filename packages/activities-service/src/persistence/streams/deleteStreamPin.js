const StreamPin = require('./model-stream-pins');

const deleteStreamPin = async ({ id, streamKey, index, activityId }) => {
  if (id) {
    return StreamPin.destroy({
      where: {
        id,
      },
    });
  }

  return StreamPin.destroy({
    where: {
      stream_key: streamKey,
      index,
      activityId,
    },
  });
};

module.exports = deleteStreamPin;
