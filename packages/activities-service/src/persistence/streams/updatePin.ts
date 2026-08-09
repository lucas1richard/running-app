import StreamPin from './model-stream-pins.ts';

const updatePin = async (activityId, pin) => {
  return StreamPin.update(pin, {
    where: {
      activityId,
      id: pin.id,
    },
  });
};

export default updatePin;
