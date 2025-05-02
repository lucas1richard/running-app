const { addStream } = require('./setupdb-couchbase');
const fetchStrava = require('./fetchStrava');
const { query } = require('./mysql-connection');
const { addCompressedRouteSql } = require('./sql-queries');

const compress = (route = [], compressionLevel = 0.0001) => {
  const roundedRoute = route.map(
    ([lat, lng], ix) => [
      (Math.round(lat / compressionLevel) * compressionLevel).toFixed(6),
      (Math.round(lng / compressionLevel) * compressionLevel).toFixed(6),
      ix, // position_index
      1, // seconds_at_coords
    ]
  );
  const compressedRoute = roundedRoute.slice(0, 1);

  for (let i = 1; i < roundedRoute.length; i++) {
    const lastEl = compressedRoute.at(-1);
    const current = roundedRoute[i];
    if (lastEl[0] !== current[0] || lastEl[1] !== current[1]) {
      compressedRoute.push(current);
    } else {
      lastEl[3] += 1;
    }
  }
  return compressedRoute;
};

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

const ingestActivityStreams = async (activityId) => {
  try {
    const stream = await fetchStrava(`/activities/${activityId}/streams?keys=${streamKeys.join(',')}`);
    await addStream({ stream }, activityId);

    const latlngStream = stream.find(({ type }) => type === 'latlng');
    const compressedRoute = compress(latlngStream.data, 0.0001);
    const date = new Date();

    await query(addCompressedRouteSql, [
      compressedRoute.map((dt) => [
        activityId,
        dt[0], // lat
        dt[1], // lon
        dt[2], // position_index,
        dt[3], // seconds_at_coords,
        0.0001, // compression_level,
        date, // createdAt
        date // updatedAt
      ]),
    ]);

    return { activityId, status: 'success' };
  } catch (err) {
    console.error('Error adding stream:', err);
    return { activityId, status: 'error', error: err.message };
  }
};

module.exports = ingestActivityStreams;
