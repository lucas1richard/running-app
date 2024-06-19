const {
  createHeartRateZonesTable,
  getAllHeartRateZones,
  addHeartRateZone,
} = require('./mysql-heart-zones');

const ZonesCache = require('./model-zones-cache')

const createHeartZonesCacheOnce = async (activityId, heartZoneId, times) => {
  await ZonesCache.create({
    where: {
      seconds_z1: times[0],
      seconds_z2: times[1],
      seconds_z3: times[2],
      seconds_z4: times[3],
      seconds_z5: times[4],
      activityId,
      heartZoneId,
    },
  }, {
    ignoreDuplicates: true,
  });
};

module.exports = {
  createHeartZonesCacheOnce,
  createHeartRateZonesTable,
  getAllHeartRateZones,
  addHeartRateZone,
};
