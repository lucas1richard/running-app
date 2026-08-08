import Activity from '../activities/model-activities.js';
import { sequelizeCoordsDistance } from '../utils.js';
import bulkCreateActivitySegments from './bulkCreateActivitySegments.js';
import bulkCreateAthleteSegments from './bulkCreateAthleteSegments.js';
import findAthleteSegmentsByActivityId from './findAthleteSegmentsByActivityId.js';
import AthleteSegment from './model-athlete-segments.js';

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

export {
  bulkCreateActivitySegments,
  bulkCreateAthleteSegments,
  findAthleteSegmentsByActivityId,
  findNearbySegmentsWithActivity,
};