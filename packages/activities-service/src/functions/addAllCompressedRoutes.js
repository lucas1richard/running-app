const receiver = require('../messageQueue/receiver');
const { query } = require('../persistence/mysql-promise');
const { getStream } = require('../persistence/setupdb-couchbase');
const { getUnroutedActivitiesSql } = require('../persistence/sql-queries');

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

const addAllCompressedRoutes = async (compressionLevel = 0.0001) => {
  // get all activities
  const ids = await query(getUnroutedActivitiesSql);

  // get activities that have streams
  const streams = await Promise.all(
    ids.map(({ id }) => new Promise((res) => getStream(id).then((stream) => {
      res([id, stream]);
    })))
  );

  const streamsToFetch = streams.filter(([, streams]) => !streams);

  streamsToFetch.forEach(([id]) => {
    receiver.sendMessage('stravaIngestionService', 'streams', id);
  });

  // get all coordinates
  await Promise.all(streams.filter(Boolean).map(({ _id: key, stream }) => {
    const latlngStream = stream.find(({ type }) => type === 'latlng');
    if (!latlngStream) {
      console.warn(`activity ${key} is missing latlng stream data, so skipping`);
      return;
    }
    const compressedRoute = compress(latlngStream.data, compressionLevel);
    const date = new Date();

    // bulk create the compressed coordinates
    return query(
      'INSERT INTO compressed_routes (activityId, lat, lon, position_index, seconds_at_coords, compression_level, createdAt, updatedAt) VALUES ?',
      [compressedRoute.map((dt) => [
        key,
        dt[0], // lat
        dt[1], // lon
        dt[2], // position_index,
        dt[3], // seconds_at_coords,
        compressionLevel, // compression_level,
        date, // createdAt
        date, // updatedAt
      ])]
    );
  }));
};

module.exports = addAllCompressedRoutes;