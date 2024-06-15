const { Sequelize } = require('sequelize');
const Activity = require('../database/sequelize-activities');
const { sequelizeCoordsDistance } = require('../database/utils');
const { makeCompressedRoute } = require('./makeCompressedRoute');
const longestCommonSubsequence = require('../utils/longestCommonSubsequence');
const RelatedActivities = require('../database/sequelize-related-activities');

const coordsEqual = (a, b) => a[0] === b[0] && a[1] === b[1];

const getComparedRoutes = async (activityId) => {
  const activity = await Activity.findOne({ where: { id: activityId } });

  if (!activity) {
    throw Error('Activity not found');
  }
  
  // get nearby activities
  const nearbyActivities = await Activity.findAll({
    where: {
      sport_type: 'Run',
      isNearby: sequelizeCoordsDistance(activity.start_latlng, 0.0006, 'start_latlng'),
      [Sequelize.Op.not]: [{ id: activityId }],
    },
  });

  const activityRoute = await makeCompressedRoute(activityId, 0.0005);
  
  // get route of each activity
  const allRoutes = await Promise.allSettled(
    nearbyActivities.map(({ id }) => makeCompressedRoute(id, 0.0005))
  );

  // compare routes
  const data = allRoutes.map(
    ({ value }) => {
      const lcs = longestCommonSubsequence(activityRoute?.route, value?.route || [], coordsEqual);
      return {
        baseActivity: activityId,
        relatedActivity: value?.activityId,
        // lcs,
        routeScoreFromRelated: lcs / value?.route?.length,
        routeScoreFromBase: lcs / activityRoute?.route?.length,
        // numberRelatedCoords: value?.route?.length,
        // numberBaseCoords: activityRoute?.route?.length,
      }
  });

  // save compared routes
  await RelatedActivities.bulkCreate(
    data,
    {
      // ignoreDuplicates: true,
      updateOnDuplicate: ['routeScoreFromRelated', 'routeScoreFromBase'],
    }
  );

  // return compared routes
  return data;
};

module.exports = {
  getComparedRoutes,
};