const { getStream, updateActivityDetail } = require('../database/setupdb-couchbase');
const { getActivityDetails } = require('./getActivityDetails');

const makeCompressedRoute = async (activityId, compressionLevel = 0.0001) => {
  // get details from couchdb
  const details = await getActivityDetails(activityId);
  
  if (!details) {
    throw new Error('Activity not found');
  }
  
  // check if route is already compressed
  if (details.compressedRoute?.[compressionLevel]) {
    return details.compressedRoute[compressionLevel];
  }

  const streams = await getStream(activityId);

  if (!streams) {
    throw new Error('Streams not found');
  }
  
  console.log(streams);
  
  // compress route
  const route = streams.stream.find(({ type }) => type === 'latlng').data;
  const factor = 1 / compressionLevel;
  const roundedRoute = route.map(([lat, lng]) => [Math.round(lat * factor) / factor, Math.round(lng * factor) / factor]);
  const compressedRoute = [];

  for (let i = 0; i < roundedRoute.length; i++) {
    if (i === 0) {
      compressedRoute.push(roundedRoute[i]);
    } else {
      const lastEl = compressedRoute[compressedRoute.length - 1];
      if (lastEl[0] !== roundedRoute[i][0] || lastEl[1] !== roundedRoute[i][1]) {
        compressedRoute.push(roundedRoute[i]);
      }
    }
  }

  // save compressed route to couchdb
  await updateActivityDetail(
    activityId,
    {
      compressedRoute: {
        ...details.compressedRoute,
        [compressionLevel]: compressedRoute,
      },
    }
  );

  // return compressed route
  return compressedRoute.length;
};

makeCompressedRoute(10757521731, 0.0005)
  .then(console.log)
  .catch(console.error);

module.exports = { makeCompressedRoute };
