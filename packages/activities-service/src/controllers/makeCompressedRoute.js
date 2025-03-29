const { findRelationsBySimilarRoute } = require('../constants');
const {
  getRouteCoordinates,
  bulkCreateRouteCoordinates
} = require('../persistence/routeCoordinates');
const {
  getStream,
  updateActivityDetail
} = require('../persistence/setupdb-couchbase');
const { getActivityDetails } = require('./getActivityDetails');

const compress = (route, compressionLevel) => {
  const roundedRoute = route.map(
    ([lat, lng]) => [
      (Math.round(lat / compressionLevel) * compressionLevel).toFixed(6),
      (Math.round(lng / compressionLevel) * compressionLevel).toFixed(6)
    ]
  );
  const compressedRoute = [];
  let count = 0;

  for (let i = 0; i < roundedRoute.length; i++) {
    if (i === 0) {
      compressedRoute.push(roundedRoute[i]);
    } else {
      const lastEl = compressedRoute[compressedRoute.length - 1];
      const current = roundedRoute[i];
      if (lastEl[0] !== current[0] || lastEl[1] !== current[1]) {
        // only include a coordinate box if the athlete spent at least 3 seconds in it.
        // this will help avoid the GPS glitches and instances where the athlete barely
        // crossed into the corner of a coordinate box
        // if (count >= 1)
        compressedRoute.push([...current, count]);
        count = 0;
      } else {
        count++;
      }
    }
  }
  return compressedRoute;
};

const makeMultiCompressedRoutes = async (activityIdsArray, compressionLevel = findRelationsBySimilarRoute.COMPRESSION_LEVEL) => {
  const existingRoutes = await getRouteCoordinates(activityIdsArray, compressionLevel);
  const compressions = {};
  const toCompress = [];

  activityIdsArray.forEach((activityId) => {
    const existingRoute = existingRoutes.find((existing) => existing.activityId === activityId);
    if (existingRoute?.route?.length) {
      compressions[activityId] = existingRoute;
    } else {
      toCompress.push(activityId);
    }
  });

  const compressedRoutes = await Promise.all(
    toCompress.map((activityId) => makeCompressedRoute(activityId, compressionLevel))
  );

  compressedRoutes.forEach((route) => {
    compressions[route.activityId] = route;
  });

  return compressions;
};

const makeCompressedRoute = async (activityId, compressionLevel = findRelationsBySimilarRoute.COMPRESSION_LEVEL, skipCheck = false) => {
  if (!skipCheck) {
    const existingRoute = await getRouteCoordinates(activityId, compressionLevel);
    console.log(`EXISTING ROUTE FOUND: ${activityId}, ${compressionLevel}`);
    if (existingRoute?.length) {
      return { activityId, route: existingRoute, compressionLevel };
    }
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

  const compressedRoute = compress(route, compressionLevel);

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

  const routeCoordsPromise = await bulkCreateRouteCoordinates(activityId, compressedRoute, compressionLevel);

  await Promise.all([
    couchDbPromise,
    routeCoordsPromise,
  ]);

  // return compressed route
  return { route: compressedRoute, activityId, compressionLevel };
};

module.exports = {
  makeMultiCompressedRoutes,
  makeCompressedRoute,
};
