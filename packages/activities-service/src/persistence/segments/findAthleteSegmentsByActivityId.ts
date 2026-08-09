import AthleteSegment from './model-athlete-segments.ts';

const findAthleteSegmentsByActivityId = async (activityId) => {
  return AthleteSegment.findAllByActivityId(activityId);
};

export default findAthleteSegmentsByActivityId;
