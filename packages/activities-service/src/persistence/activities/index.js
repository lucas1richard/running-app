const { Sequelize } = require('sequelize');
const Activity = require('./model-activities');
const findRelationsBySimilarRoute = require('./findRelationsBySimilarRoute');
const { sequelizeCoordsDistance } = require('../utils');
const findRelationsBySimilarSegments = require('./findRelationsBySimilarSegments');
const updateActivityById = require('./updateActivityById');
const bulkCreateRelatedSegments = require('./bulkCreateRelatedSegments');
const bulkCreateRelatedRoutes = require('./bulkCreateRelatedRoutes');

const findActivityById = async (id) => {
  return Activity.findByPk(id);
};

const findAllActivities = async (rowLimit) => {
  return Activity.findAll({
    where: {
      sport_type: 'Run',
    },
    order: [['start_date', 'DESC']],
    limit: rowLimit,
  })
};

const findNearbyStartingActivities = async (activity) => {
  Activity.findAll({
    where: {
      sport_type: 'Run',
      isNearby: sequelizeCoordsDistance(activity.start_latlng, 0.0006, 'start_latlng'),
      [Sequelize.Op.not]: [{ id: activity.id }],
    },
  })
};

module.exports = {
  bulkCreateRelatedRoutes,
  bulkCreateRelatedSegments,
  findActivityById,
  findAllActivities,
  findNearbyStartingActivities,
  findRelationsBySimilarRoute,
  findRelationsBySimilarSegments,
  updateActivityById,
};
