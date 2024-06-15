const RouteCoordinates = require('../persistence/sequelize-route-coordinates');
const { getStream, updateActivityDetail } = require('../persistence/setupdb-couchbase');
const { getActivityDetails } = require('./getActivityDetails');

const makeCompressedRoute = async (activityId, compressionLevel = 0.0001) => {
  const existingRoute = await RouteCoordinates.getRouteCoordinates(activityId, compressionLevel);
  if (existingRoute?.length) {
    return { activityId, route: existingRoute, compressionLevel };
  }

  // get details from couchdb
  const details = await getActivityDetails(activityId);

  if (!details) {
    throw new Error('Activity not found');
  }

  // check if route is already compressed
  // if (details.compressedRoute?.[compressionLevel]) {
  //   return details.compressedRoute[compressionLevel];
  // }

  const streams = await getStream(activityId);

  if (!streams) {
    throw new Error('Streams not found');
  }

  // compress route
  const route = streams.stream.find(({ type }) => type === 'latlng').data;

  if (compressionLevel === 0) {
    return { activityId, route, compressionLevel };
  }

  const factor = 1 / compressionLevel;
  const roundedRoute = route.map(
    ([lat, lng]) => [Math.round(lat * factor) / factor, Math.round(lng * factor) / factor]
  );
  const compressedRoute = [];
  let count = 0;

  for (let i = 0; i < roundedRoute.length; i++) {
    if (i === 0) {
      compressedRoute.push(roundedRoute[i]);
    } else {
      const lastEl = compressedRoute[compressedRoute.length - 1];
      if (lastEl[0] !== roundedRoute[i][0] || lastEl[1] !== roundedRoute[i][1]) {
        compressedRoute.push(count > 1 ? [...roundedRoute[i], count] : roundedRoute[i]);
        count = 0;
      } else {
        count++;
      }
    }
  }

  // save compressed route to couchdb
  const couchDbPromise = updateActivityDetail(
    activityId,
    {
      compressedRoute: {
        ...details.compressedRoute,
        [compressionLevel]: compressedRoute,
      },
    }
  );

  const routeCoordsPromise = RouteCoordinates.bulkCreate(
    compressedRoute.map(([lat, lon, seconds_at_coords = 1], index) => ({
      lat,
      lon,
      position_index: index,
      seconds_at_coords,
      activityId,
      compression_level: compressionLevel,
    }))
  );

  await Promise.all([
    couchDbPromise,
    routeCoordsPromise,
  ]);

  // return compressed route
  return { route: compressedRoute, activityId, compressionLevel };
};

module.exports = {
  makeCompressedRoute,
};
