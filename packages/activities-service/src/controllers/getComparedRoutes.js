const { makeCompressedRoute, makeMultiCompressedRoutes } = require('./makeCompressedRoute');
const longestCommonSubsequence = require('../utils/longestCommonSubsequence');
const { findActivityById, bulkCreateRelatedRoutes } = require('../persistence/activities');
const findSimilarStartDistance = require('../persistence/activities/findSimilarStartDistance');

const coordsEqual = (a, b) => a[0] === b[0] && a[1] === b[1];

const getComparedRoutes = async (activityId) => {
  const activity = await findActivityById(activityId);

  if (!activity) {
    throw Error('Activity not found');
  }

  // get nearby activities
  const nearbyActivities = await findSimilarStartDistance(activity, 50, true);
  const activityRoute = await makeCompressedRoute(activityId, 0.0005);

  // get route of each activity
  const allRoutes = await makeMultiCompressedRoutes(nearbyActivities.map(({ id }) => id), 0.0005);

  // compare routes
  const data = Object.values(allRoutes).map(
    (value) => {
      const lcs = longestCommonSubsequence(activityRoute?.route, value?.route || [], coordsEqual);
      return {
        baseActivity: activityId,
        relatedActivity: value?.activityId,
        longestCommonSegmentSubsequence: lcs,
        routeScoreFromRelated: lcs / value?.route?.length,
        routeScoreFromBase: lcs / activityRoute?.route?.length,
        numberRelatedCoords: value?.route?.length,
        numberBaseCoords: activityRoute?.route?.length,
      }
  });

  // save compared routes
  await bulkCreateRelatedRoutes(data);

  // return compared routes
  return data;
};

module.exports = {
  getComparedRoutes,
};