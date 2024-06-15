const ActivitySegment = require('./model-activity-segments');


const bulkCreateActivitySegments = async (activityId, segmentEfforts) => {
  return ActivitySegment.bulkCreate(segmentEfforts.map(({ segment: se }) => ({
    ...se,
    start_latlng: {
      type: 'Point',
      coordinates: se.start_latlng?.length ? se.start_latlng : [0, 0],
    },
    end_latlng: {
      type: 'Point',
      coordinates: se.end_latlng?.length ? se.end_latlng : [0, 0],
    },
    activityId: activityId,
  })), {
    ignoreDuplicates: true,
    logging: false,
  });
};

module.exports = bulkCreateActivitySegments;