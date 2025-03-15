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
  const activityRoute = await makeCompressedRoute(activityId);
  const activityRouteStr = typeof activityRoute.route[0][0] === 'string' ? activityRoute.route : activityRoute.route.map((a) => [a[0].toFixed(6), a[1].toFixed(6), a[2]])

  // get route of each activity
  const allRoutes = await makeMultiCompressedRoutes(nearbyActivities.map(({ id }) => id));

  // compare routes
  const data = Object.values(allRoutes).map(
    (value) => {
      const lcs = longestCommonSubsequence(activityRouteStr, value?.route || [], coordsEqual);
      return {
        baseActivity: activityId,
        relatedActivity: value?.activityId,
        longestCommonSegmentSubsequence: lcs,
        routeScoreFromRelated: value?.route ? lcs / value.route.length : 0,
        routeScoreFromBase: activityRouteStr ? lcs / activityRouteStr.length : 0,
        numberRelatedSegments: value?.route?.length,
        numberBaseSegments: activityRouteStr?.length,
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