const Activity = require('./sequelize-activities');
const ActivitySegment = require('./sequelize-activity-segments');
const AthleteSegment = require('./sequelize-athlete-segments');
const HeartZones = require('./sequelize-heartzones');
const Weather = require('./sequelize-weather');
const ZonesCache = require('./sequelize-zones-cache');

const initSequelize = async () => {
  Activity.hasMany(ZonesCache);
  ZonesCache.belongsTo(Activity);
  ZonesCache.belongsTo(HeartZones);
  Activity.hasOne(Weather);
  Weather.belongsTo(Activity);
  Activity.hasMany(ActivitySegment);
  Activity.hasMany(AthleteSegment);
  AthleteSegment.hasOne(ActivitySegment);

  await Promise.allSettled([
    ActivitySegment.sync({ force: false }),
    AthleteSegment.sync({ force: false }),
  
    Activity.sync(),
    ZonesCache.sync(),
    HeartZones.sync(),
    Weather.sync({ force: false }),
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
    }, {
      model: Weather,
      attributes: [
        'sky',
        'precipitation',
        'temperature',
        'temperature_unit',
        'humidity',
        'wind'
      ],
    }]
  });
};

module.exports = {
  initSequelize,
};
