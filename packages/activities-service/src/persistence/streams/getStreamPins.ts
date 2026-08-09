import StreamPin from './model-stream-pins.ts';

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

export default getStreamPins;
