const { sequelizeMysql } = require('./sequelize-mysql');

const Activity = require('./activities/model-activities');
const ActivitySegment = require('./segments/model-activity-segments');
const AthleteSegment = require('./segments/model-athlete-segments');
const BestEfforts = require('./activities/model-best-efforts');
const HeartZones = require('./heartzones/model-heartzones');
const RelatedActivities = require('./activities/model-related-activities');
const Weather = require('./weather/weather-model');
const ZonesCache = require('./heartzones/model-zones-cache');
const RouteCoordinates = require('./routeCoordinates/model-route-coordinates');
const { Sequelize } = require('sequelize');

const initSequelize = async () => {
  try {
    Activity.hasMany(BestEfforts);
    Activity.hasMany(ZonesCache);
    ZonesCache.belongsTo(Activity);
    BestEfforts.belongsTo(Activity);
    ZonesCache.belongsTo(HeartZones);
    Activity.hasOne(Weather);
    Weather.belongsTo(Activity);
    Activity.hasMany(RouteCoordinates);
    RouteCoordinates.belongsTo(Activity, { foreignKey: 'activityId' });
  
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
    await BestEfforts.sync();
    await ZonesCache.sync();
    await HeartZones.sync();
    await Weather.sync({ force: false });
    await RouteCoordinates.sync({ force: false });
  
    await Activity.addScope('defaultScope', {
      where: {
        sport_type: 'Run',
        [Sequelize.Op.or]: [
          { hidden: false },
          { hidden: null },
        ],
      },
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
      }, {
        model: BestEfforts,
      }]
    }, {
      override: true,
    });
  } catch (err) {
    console.error(err);
  }
};


module.exports = {
  initSequelize,
};
