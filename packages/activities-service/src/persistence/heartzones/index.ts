import {
  createHeartRateZonesTable,
  getAllHeartRateZones,
  addHeartRateZone,
} from './mysql-heart-zones.ts';

import ZonesCache from './model-zones-cache.ts';

const createHeartZonesCacheOnce = async (activityId, heartZoneId, times) => {
  await ZonesCache.create({
    seconds_z1: times[0],
    seconds_z2: times[1],
    seconds_z3: times[2],
    seconds_z4: times[3],
    seconds_z5: times[4],
    activityId,
    heartZoneId,
  }, {
    ignoreDuplicates: true,
  });
};

export {
  createHeartZonesCacheOnce,
  createHeartRateZonesTable,
  getAllHeartRateZones,
  addHeartRateZone,
};
