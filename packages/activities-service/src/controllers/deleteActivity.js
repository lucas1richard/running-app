const Activity = require('../persistence/activities/model-activities');
const AthleteSegment = require('../persistence/segments/model-athlete-segments');
const BestEfforts = require('../persistence/activities/model-best-efforts');
const RouteCoordinates = require('../persistence/routeCoordinates/model-route-coordinates');
const StreamPin = require('../persistence/streams/model-stream-pins');
const ZonesCache = require('../persistence/heartzones/model-zones-cache');
const {
  destroyActivity,
  destroyActivityDetail,
  destroyActivityPreferences,
  destroyStream,
} = require('../persistence/setupdb-couchbase');

const deleteActivity = async (activityId) => {
  await Promise.all([
    Activity.destroy({ where: { id: activityId } }),
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

module.exports = {
  deleteActivity,
};
