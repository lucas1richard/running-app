import StreamPin from './model-stream-pins.ts';

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

export default deleteStreamPin;
