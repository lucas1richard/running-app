const { Transform, pipeline, Readable } = require('node:stream');
const { Sequelize } = require('sequelize');
const Activity = require('./model-activities');
const findRelationsBySimilarRoute = require('./findRelationsBySimilarRoute');
const { sequelizeCoordsDistance } = require('../utils');
const findRelationsBySimilarSegments = require('./findRelationsBySimilarSegments');
const updateActivityById = require('./updateActivityById');
const bulkCreateRelatedSegments = require('./bulkCreateRelatedSegments');
const bulkCreateRelatedRoutes = require('./bulkCreateRelatedRoutes');
const { logger } = require('../../utils/logger');
const { queryStream } = require('../mysql-connection');
const { BatchTransformer } = require('../../utils/streams');
const { getActivitiesSql, getActivitiesByIdSql } = require('../sql-queries');

const findActivityById = async (id) => {
  return Activity.findByPk(id);
};

const findAllActivities = async (rowLimit) => {
  return Activity.findAll({
    // where: {
    //   sport_type: 'Run',
    // },
    order: [['start_date', 'DESC']],
    limit: rowLimit,
  })
};

const findAllActivitiesStream = async () => {
  logger.info('Fetching all activities from MySQL with stream');

  const readable = await queryStream({ sql: getActivitiesSql, streamOptions: { highWaterMark: 30 }})

  readable.on('close', () => {
    logger.info('Readable stream closed');
  });

  logger.info('Stream created', { service: 'activities-service' });

  const rowEnhancer = new Transform({
    transform: function (row, enc, cb) {
      row.distance = Math.round(row.distance * 100) / 100;
      row.distance_miles = Math.round(row.distance_miles * 100) / 100;
      row.total_elevation_gain = Number(row.total_elevation_gain);
      row.average_seconds_per_mile = Math.round(row.average_seconds_per_mile);
      row.average_speed = Number(row.average_speed);
      row.max_speed = Number(row.max_speed);
      row.average_heartrate = Number(row.average_heartrate);
      row.elev_high = Number(row.elev_high);
      row.elev_low = Number(row.elev_low);
      this.push(row);
      cb();
    },
    objectMode: true,
  });

  const batcher = new BatchTransformer(30);

  return pipeline(readable, rowEnhancer, batcher, (err) => {
    if (err) {
      logger.error('Pipeline failed', { error: err });
    }
  });
};

const findActivitiesByIdStream = async (idsArray = []) => {
  logger.info('Fetching all activities from MySQL with stream');

  const readable = idsArray.length === 0 ? new Readable({
    read() {
      this.push(null);
    }
  }) : await queryStream({
    sql: getActivitiesByIdSql,
    queryOptions: { values: [idsArray] },
    streamOptions: { highWaterMark: 30 }
  });

  readable.on('close', () => {
    logger.info('Readable stream closed');
  });

  logger.info('Stream created', { service: 'activities-service' });

  const rowEnhancer = new Transform({
    transform: function (row, enc, cb) {
      row.distance = Math.round(row.distance * 100) / 100;
      row.distance_miles = Math.round(row.distance_miles * 100) / 100;
      row.total_elevation_gain = Number(row.total_elevation_gain);
      row.average_seconds_per_mile = Math.round(row.average_seconds_per_mile);
      row.average_speed = Number(row.average_speed);
      row.max_speed = Number(row.max_speed);
      row.average_heartrate = Number(row.average_heartrate);
      row.elev_high = Number(row.elev_high);
      row.elev_low = Number(row.elev_low);
      this.push(row);
      cb();
    },
    objectMode: true,
  });

  const batcher = new BatchTransformer(30);

  return pipeline(readable, rowEnhancer, batcher, (err) => {
    if (err) {
      logger.error('Pipeline failed', { error: err });
    }
  });
};

const findNearbyStartingActivities = async (activity) => {
  Activity.findAll({
    where: {
      // sport_type: 'Run',
      isNearby: sequelizeCoordsDistance(activity.start_latlng,
        0.0006,
        'start_latlng'),
      [Sequelize.Op.not]: [{ id: activity.id }],
    },
  })
};

module.exports = {
  bulkCreateRelatedRoutes,
  bulkCreateRelatedSegments,
  findActivityById,
  findAllActivities,
  findAllActivitiesStream,
  findActivitiesByIdStream,
  findNearbyStartingActivities,
  findRelationsBySimilarRoute,
  findRelationsBySimilarSegments,
  updateActivityById,
};
