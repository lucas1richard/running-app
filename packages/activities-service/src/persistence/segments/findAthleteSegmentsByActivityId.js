const AthleteSegment = require('./model-athlete-segments');

const findAthleteSegmentsByActivityId = async (activityId) => {
  return AthleteSegment.findAllByActivityId(activityId)
};

module.exports = findAthleteSegmentsByActivityId;
