const StreamPin = require('./model-stream-pins');

const addStreamPin = async ({
  streamKey,
  index,
  label,
  description,
  activityId,
  latlng,
}) => {
  return StreamPin.create({
    stream_key: streamKey,
    index,
    label,
    description,
    activityId,
    latlng: {
      type: 'Point',
      coordinates: latlng?.length ? latlng : [0, 0],
    },
  });
}

module.exports = addStreamPin;
