const { makeCompressedRoute, makeMultiCompressedRoutes } = require('./makeCompressedRoute');
const { findActivityById, bulkCreateRelatedRoutes } = require('../persistence/activities');
const findSimilarStartDistance = require('../persistence/activities/findSimilarStartDistance');
const activityMatchingReceiver = require('../grpc/activityMatchingReceiver');

const getComparedRoutes = async (activityId) => {
  const activity = await findActivityById(activityId);

  if (!activity) {
    throw Error('Activity not found');
  }

  // get nearby activities
  const nearbyActivities = await findSimilarStartDistance(activity, 50, true);
  const activityRoute = await makeCompressedRoute(activityId);
  const activityRouteStr = typeof activityRoute.route[0][0] === 'string'
    ? activityRoute.route
    : activityRoute.route.map((a) => [a[0].toFixed(6), a[1].toFixed(6), a[2]])

  // get route of each activity
  const nearbyActivitiesIds = nearbyActivities.map(({ id }) => id);
  const allRoutes = await makeMultiCompressedRoutes(nearbyActivitiesIds);
  const lcsMap = await activityMatchingReceiver.getLongestCommonSubsequence(activityId, nearbyActivitiesIds);

  // compare routes
  const data = Object.values(allRoutes).reduce(
    (acc, value) => {
      const lcsItem = lcsMap[value?.activityId];
      const lcs = lcsItem?.longestCommonSubsequence;
      const lcsError = lcsItem?.error;
      if (lcsError || !value) return acc;
      acc.push({
        baseActivity: activityId,
        relatedActivity: value.activityId,
        longestCommonSegmentSubsequence: lcs,
        routeScoreFromRelated: value.route ? lcs / value.route.length : 0,
        routeScoreFromBase: activityRouteStr ? lcs / activityRouteStr.length : 0,
        numberRelatedSegments: value.route?.length,
        numberBaseSegments: activityRouteStr?.length,
      });
      return acc;
  }, []);

  // save compared routes
  await bulkCreateRelatedRoutes(data);

  // return compared routes
  return data;
};

module.exports = {
  getComparedRoutes,
};