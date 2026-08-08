import Activity from '../persistence/activities/model-activities.js';
import AthleteSegment from '../persistence/segments/model-athlete-segments.js';
import BestEfforts from '../persistence/activities/model-best-efforts.js';
import RouteCoordinates from '../persistence/routeCoordinates/model-route-coordinates.js';
import StreamPin from '../persistence/streams/model-stream-pins.js';
import ZonesCache from '../persistence/heartzones/model-zones-cache.js';
import {
  destroyActivity,
  destroyActivityDetail,
  destroyActivityPreferences,
  destroyStream,
} from '../persistence/setupdb-couchbase.js';

const deleteActivity = async (activityId) => {
  await Promise.all([
    Activity.scope('').destroy({ where: { id: activityId } }),
    AthleteSegment.destroy({ where: { activityId } }),
    BestEfforts.destroy({ where: { activityId } }),
    StreamPin.destroy({ where: { activityId } }),
    ZonesCache.destroy({ where: { activityId } }),
    RouteCoordinates.destroy({ where: { activityId } }),
    destroyActivity(activityId),
    destroyActivityDetail(activityId),
    destroyActivityPreferences(activityId),
    destroyStream(activityId),
  ])
};

export {
  deleteActivity,
};
