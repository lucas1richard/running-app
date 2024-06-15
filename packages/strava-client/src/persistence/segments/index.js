const Activity = require('../sequelize-activities');
const { sequelizeCoordsDistance } = require('../utils');
const bulkCreateActivitySegments = require('./bulkCreateActivitySegments');
const bulkCreateAthleteSegments = require('./bulkCreateAthleteSegments');
const findAthleteSegmentsByActivityId = require('./findAthleteSegmentsByActivityId');
const AthleteSegment = require('./model-athlete-segments');

const findNearbySegmentsWithActivity = async (start_latlng) => {
  return AthleteSegment.findAll({
    order: [['start_date', 'ASC']],
    attributes: ['activityId', 'activitySegmentId'],
    include: [
      {
        model: Activity,
        where: {
          isNearby: sequelizeCoordsDistance(start_latlng, 0.0006, 'start_latlng'),
        },
      }
    ],
  })
};

module.exports = {
  bulkCreateActivitySegments,
  bulkCreateAthleteSegments,
  findAthleteSegmentsByActivityId,
  findNearbySegmentsWithActivity,
};