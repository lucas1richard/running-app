const Activity = require('./sequelize-activities');
const ActivitySegment = require('./sequelize-activity-segments');
const AthleteSegment = require('./sequelize-athlete-segments');
const HeartZones = require('./sequelize-heartzones');
const {sequelizeMysql} = require('./sequelize-mysql');
const RelatedActivities = require('./sequelize-related-activities');
const Weather = require('./sequelize-weather');
const ZonesCache = require('./sequelize-zones-cache');

const initSequelize = async () => {
  try {

    Activity.hasMany(ZonesCache);
    ZonesCache.belongsTo(Activity);
    ZonesCache.belongsTo(HeartZones);
    Activity.hasOne(Weather);
    Weather.belongsTo(Activity);
  
    Activity.hasMany(AthleteSegment);
  
    AthleteSegment.belongsTo(ActivitySegment, { foreignKey: 'activitySegmentId' });
    AthleteSegment.belongsTo(Activity, { foreignKey: 'activityId' });

    Activity.belongsToMany(Activity, { as: 'relatedActivity', through: RelatedActivities, foreignKey: 'relatedActivity' });
    Activity.belongsToMany(Activity, { as: 'baseActivity', through: RelatedActivities, foreignKey: 'baseActivity' });

    await sequelizeMysql.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelizeMysql.query("SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));");
    await Promise.all([
      AthleteSegment.sync({ force: false }),
    ]);
    await RelatedActivities.sync({ force: false });
    await ActivitySegment.sync({ force: false });
    await Activity.sync();
    await ZonesCache.sync();
    await HeartZones.sync();
    await Weather.sync({ force: false });
  
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

    sequelizeMysql.addScope('defaultScope', {
      exclude: ['createdAt', 'updatedAt'],
    });

  } catch (err) {
    console.error(err);

  }
};

module.exports = {
  initSequelize,
};
