const { getStream } = require('../persistence/setupdb-couchbase');

const streamKeys = [
  'time',
  'distance',
  'latlng',
  'altitude',
  'velocity_smooth',
  'heartrate',
  'cadence',
  'watts',
  'temp',
  'moving',
  'grade_smooth',
];

const getActivityStreams = async (activityId, keys = streamKeys) => {
  const matchKeys = (streamData) => keys.map(
    (key) => streamData?.find?.(({ type }) => type === key)
      || { type: key, data: [], notFound: true }
  );

  const cachedStream = await getStream(activityId);
  if (cachedStream) {
    return matchKeys(cachedStream.stream);
  }
};

module.exports = {
  getActivityStreams,
};