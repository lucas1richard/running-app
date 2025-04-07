const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const Activity = require('./model-activities');
const findRelationsBySimilarRoute = require('./findRelationsBySimilarRoute');
const { sequelizeCoordsDistance } = require('../utils');
const findRelationsBySimilarSegments = require('./findRelationsBySimilarSegments');
const updateActivityById = require('./updateActivityById');
const bulkCreateRelatedSegments = require('./bulkCreateRelatedSegments');
const bulkCreateRelatedRoutes = require('./bulkCreateRelatedRoutes');
const { logger } = require('../../utils/logger');
const { queryStream, getMySQLConnection } = require('../mysql-connection');
const { BatchTransformer } = require('../../utils/streams');

const activitiesQuery = fs.readFileSync(path.resolve(path.join(__dirname, './getactivities.sql'))).toString();
const activitiesByIdQuery = fs.readFileSync(path.resolve(path.join(__dirname, './getactivitiesById.sql'))).toString();


const findActivityById = async (id) => {
  return (await getMySQLConnection()).query(activitiesByIdQuery, [id]);
};
