const Activity = require('./sequelize-activities');
const HeartZones = require('./sequelize-heartzones');
const ZonesCache = require('./sequelize-zones-cache');

const initSequelize = async () => {
  Activity.hasOne(ZonesCache);
  ZonesCache.belongsTo(Activity);
  ZonesCache.belongsTo(HeartZones);
  
  await Promise.allSettled([
    Activity.sync(),
    ZonesCache.sync(),
    HeartZones.sync(),
  ]);
};

module.exports = {
  initSequelize,
};
