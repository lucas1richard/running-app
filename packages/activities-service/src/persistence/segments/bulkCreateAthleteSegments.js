const AthleteSegment = require('./model-athlete-segments');

const bulkCreateAthleteSegments = async (activityId, segmentEfforts) => {
  return AthleteSegment.bulkCreate(segmentEfforts.map(({ segment: se, ...rest }) => ({
    ...rest,
    start_date: new Date(rest.start_date),
    activityId: activityId,
    activitySegmentId: se.id,
  }), {
    ignoreDuplicates: true,
    logging: false,
  }), {
    ignoreDuplicates: true,
    logging: false,
  });
};

module.exports = bulkCreateAthleteSegments;
