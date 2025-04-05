const fs = require('fs');
const path = require('path');
const RouteCoordinates = require('./model-route-coordinates');
const { queryStream } = require('../mysql-connection');
const { pipeline } = require('stream');
const { BatchTransformer } = require('../../utils/streams');
const assert = require('assert');

const heatMapAllTimeSql = fs.readFileSync(path.join(__dirname, 'getHeatMap.sql'), 'utf8');
const heatMapTimeframeSql = fs.readFileSync(path.join(__dirname, 'getHeatMapByTimeframe.sql'), 'utf8');

// class SumTransformer extends Transform {
//   constructor(iteratorSize = 10e3, options) {
//     super({ ...options, objectMode: true });
//     this.coords = {};
//     this.iterator = 0;
//     this.iteratorSize = iteratorSize;
//   }

//   _transform(chunk, encoding, callback) {
//     this.iterator++;
//     const coordsKey = `${chunk.lat},${chunk.lon}`;
//     if (!this.coords[coordsKey]) {
//       this.coords[coordsKey] = { lat: chunk.lat, lon: chunk.lon, seconds_at_coords: 0 };
//     }
//     this.coords[coordsKey].seconds_at_coords += chunk.seconds_at_coords;
//     if (!(this.iterator % this.iteratorSize)) this.push(Object.values(this.coords));
//     callback();
//   }

//   _flush(callback) {
//     this.push(Object.values(this.coords));
//     callback();
//   }
// }

const getAllCoordinatesStream = async (referenceTime, timeframe) => {
  if (timeframe) {
    assert(
      timeframe.toLowerCase().match(/^\d{1,2}\s*(day|week|month|year)?$/i),
      'Timeframe must be a single or double digit number followed by day, month, or year (e.g. "7 day", "1 wee", "1 month", "2 year")'
    );
  }
  if (referenceTime) {
    assert(
      new Date(referenceTime).toString() !== 'Invalid Date',
      'Reference time must be a valid date'
    );
  }
  const sql = timeframe ? heatMapTimeframeSql : heatMapAllTimeSql;
  const readable = await queryStream({
    sql: sql.replace(/_timeframe/g, timeframe),
    queryOptions: { values: [referenceTime, timeframe] },
    streamOptions: { highWaterMark: 500 },
});
  return pipeline(readable, new BatchTransformer(500), (err) => {
    if (err) {
      console.error('Pipeline failed', err);
    }
  });
};

const getRouteCoordinates = async (activityId, compressionLevel) => {
  return RouteCoordinates.getRouteCoordinates(activityId, compressionLevel);
}

const bulkCreateRouteCoordinates = async (activityId, compressedRoute, compressionLevel) => {
  console.log('bulkCreateRouteCoordinates', activityId, compressedRoute.length);
  return RouteCoordinates.bulkCreate(
    compressedRoute.map(([lat, lon, seconds_at_coords = 1], index) => ({
      lat,
      lon,
      position_index: index,
      seconds_at_coords,
      activityId,
      compression_level: compressionLevel,
    })),
    {
      updateOnDuplicate: ['seconds_at_coords', 'compression_level'],
      // logging: false,
    }
  );
};

module.exports = {
  getRouteCoordinates,
  getAllCoordinatesStream,
  bulkCreateRouteCoordinates,
};