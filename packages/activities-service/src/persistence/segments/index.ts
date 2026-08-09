import Activity from '../activities/model-activities.ts';
import { sequelizeCoordsDistance } from '../utils.ts';
import bulkCreateActivitySegments from './bulkCreateActivitySegments.ts';
import bulkCreateAthleteSegments from './bulkCreateAthleteSegments.ts';
import findAthleteSegmentsByActivityId from './findAthleteSegmentsByActivityId.ts';
import AthleteSegment from './model-athlete-segments.ts';

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
  });
};

export {
  bulkCreateActivitySegments,
  bulkCreateAthleteSegments,
  findAthleteSegmentsByActivityId,
  findNearbySegmentsWithActivity,
};