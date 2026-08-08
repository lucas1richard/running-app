import { sequelizeMysql } from './sequelize-mysql.js';

import Activity from './activities/model-activities.js';
import ActivitySegment from './segments/model-activity-segments.js';
import AthleteSegment from './segments/model-athlete-segments.js';
import BestEfforts from './activities/model-best-efforts.js';
import HeartZones from './heartzones/model-heartzones.js';
import RelatedActivities from './activities/model-related-activities.js';
import Weather from './weather/weather-model.js';
import ZonesCache from './heartzones/model-zones-cache.js';
import RouteCoordinates from './routeCoordinates/model-route-coordinates.js';
import { Sequelize } from 'sequelize';
import StreamPin from './streams/model-stream-pins.js';
import CalculatedBestEfforts from './activities/model-calculated-efforts.js';
import HourlyWeather from './weather2/weather-model.js';

const initSequelize = async () => {
  try {
    Activity.hasMany(CalculatedBestEfforts);
    Activity.hasMany(BestEfforts);
    Activity.hasMany(ZonesCache);
    Activity.hasMany(StreamPin);
    StreamPin.belongsTo(Activity);
    BestEfforts.belongsTo(Activity);
    CalculatedBestEfforts.belongsTo(Activity);
    ZonesCache.belongsTo(Activity);
    ZonesCache.belongsTo(HeartZones);
    Activity.hasOne(Weather);
    Weather.belongsTo(Activity);
    Activity.hasMany(HourlyWeather);
    HourlyWeather.belongsTo(Activity);
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
    await StreamPin.sync();
    await BestEfforts.sync();
    await CalculatedBestEfforts.sync();
    await ZonesCache.sync();
    await HeartZones.sync();
    await Weather.sync({ force: false });
    await HourlyWeather.sync({ force: false });
    await RouteCoordinates.sync({ force: false });

    await Activity.addScope('defaultScope', {
      where: {
        // sport_type: 'Run',
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
      },
      {
        model: HourlyWeather,
        attributes: [
          'apparent_temperature',
          'cloud_cover',
          'dew_point_2m',
          'precipitation',
          'precipitation_probability',
          'relative_humidity_2m',
          'temperature_2m',
          'time',
          'weather_code',
          'wind_gusts_10m',
          'wind_speed_10m',
        ],
      }, {
        model: CalculatedBestEfforts,
      }, {
        model: StreamPin,
      }]
    }, {
      override: true,
    });
    // await CalculatedBestEfforts.seedDatabase();
  } catch (err) {
    console.error(err);
  }
};


export {
  initSequelize,
};
