import AthleteSegment from './model-athlete-segments.js';

const findAthleteSegmentsByActivityId = async (activityId) => {
  return AthleteSegment.findAllByActivityId(activityId)
};

export default findAthleteSegmentsByActivityId;
