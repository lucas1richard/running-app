const Activity = require('./sequelize-activities');
const HeartZones = require('./sequelize-heartzones');
const ZonesCache = require('./sequelize-zones-cache');

const initSequelize = async () => {
  Activity.hasMany(ZonesCache);
  ZonesCache.belongsTo(Activity);
  ZonesCache.belongsTo(HeartZones);
  
  await Promise.allSettled([
    Activity.sync(),
    ZonesCache.sync(),
    HeartZones.sync(),
  ]);

  await Activity.addScope('defaultScope', {
    include: [{
      model: ZonesCache,
      attributes: [
        'seconds_z1',
        'seconds_z2',
        'seconds_z3',
        'seconds_z4',
        'seconds_z5',
        'heartZoneId',
      ],
    }]
  });
};

module.exports = {
  initSequelize,
};
