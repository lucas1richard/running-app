import Activity from '../persistence/activities/model-activities.ts';
import AthleteSegment from '../persistence/segments/model-athlete-segments.ts';
import BestEfforts from '../persistence/activities/model-best-efforts.ts';
import RouteCoordinates from '../persistence/routeCoordinates/model-route-coordinates.ts';
import StreamPin from '../persistence/streams/model-stream-pins.ts';
import ZonesCache from '../persistence/heartzones/model-zones-cache.ts';
import {
  destroyActivity,
  destroyActivityDetail,
  destroyActivityPreferences,
  destroyStream,
} from '../persistence/setupdb-couchbase.ts';

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
  ]);
};

export {
  deleteActivity,
};
