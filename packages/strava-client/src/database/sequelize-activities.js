const { DataTypes, Model } = require('sequelize');
const { sequelizeMysql } = require('./sequelize-mysql');
const { getAllActivities } = require('./setupdb-couchbase');
const { getSecondsPerMile } = require('../utils/unitConversions');

class Activity extends Model {
  static async bulkAddFromStrava(stravaActivities) {
    if (stravaActivities.length > 0) {
      try {
        const records = await this.bulkCreate(stravaActivities.map((av) => ({
          ...av,
          start_latlng: {
            type: 'Point',
            coordinates: av.start_latlng?.length ? av.start_latlng : [0, 0],
          },
          end_latlng: {
            type: 'Point',
            coordinates: av.end_latlng?.length ? av.end_latlng : [0, 0],
          },
          summary_polyline: av.map?.summary_polyline,
        })), {
          ignoreDuplicates: true,
          logging: false,
        });

        console.log(`Bulk Add Activities Complete - ${stravaActivities.length} records`)

        return records;
      } catch (err) {
        console.log(err);
        return [];
      }
    }
  }
  static async syncWithCouch() {
    const existingActivities = await getAllActivities();
    await this.bulkAddFromStrava(existingActivities);
  }
}

Activity.init(
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    has_streams: {
      type: DataTypes.BOOLEAN
    },
    name: {
      type: DataTypes.STRING(255)
    },
    distance: {
      type: DataTypes.DECIMAL(7, 2),
      get() {
        return Number(this.getDataValue('distance'));
      }
    },
    distance_miles: {
      type: DataTypes.VIRTUAL,
      get() {
        const distance_meters = this.distance;
        const distance_miles = distance_meters / 1609;
        return Math.round(distance_miles * 100) / 100;
      }
    },
    moving_time: {
      type: DataTypes.MEDIUMINT
    },
    elapsed_time: {
      type: DataTypes.MEDIUMINT
    },
    total_elevation_gain: {
      type: DataTypes.DECIMAL(7, 2),
      get() {
        return Number(this.getDataValue('total_elevation_gain'));
      }
    },
    type: {
      type: DataTypes.STRING(100)
    },
    average_seconds_per_mile: {
      type: DataTypes.VIRTUAL,
      get() {
        const moving_time = this.moving_time;
        const distance_miles = this.distance_miles;
        const seconds_per_mile = moving_time / distance_miles;
        return Math.round(seconds_per_mile);
      }
    },
    min_seconds_per_mile: {
      type: DataTypes.VIRTUAL,
      get() {
        const max_speed = this.max_speed;
        const seconds_per_mile = getSecondsPerMile(max_speed);
        return Math.round(seconds_per_mile);
      }
    },
    max_seconds_per_mile: {
      type: DataTypes.VIRTUAL,
      get() {
        const min_speed = this.average_speed;
        const seconds_per_mile = getSecondsPerMile(min_speed);
        return Math.round(seconds_per_mile);
      }
    },
    sport_type: {
      type: DataTypes.STRING(100)
    },
    start_date: {
      type: DataTypes.DATE
    },
    start_date_local: {
      type: DataTypes.DATE
    },
    timezone: {
      type: DataTypes.STRING(255)
    },
    utc_offset: {
      type: DataTypes.MEDIUMINT
    },
    location_city: {
      type: DataTypes.STRING(255)
    },
    location_state: {
      type: DataTypes.STRING(255)
    },
    location_country: {
      type: DataTypes.STRING(255)
    },
    achievement_count: {
      type: DataTypes.SMALLINT
    },
    kudos_count: {
      type: DataTypes.SMALLINT
    },
    comment_count: {
      type: DataTypes.SMALLINT
    },
    athlete_count: {
      type: DataTypes.SMALLINT
    },
    photo_count: {
      type: DataTypes.SMALLINT
    },
    trainer: {
      type: DataTypes.BOOLEAN
    },
    commute: {
      type: DataTypes.BOOLEAN
    },
    manual: {
      type: DataTypes.BOOLEAN
    },
    private: {
      type: DataTypes.BOOLEAN
    },
    visibility: {
      type: DataTypes.STRING(100)
    },
    flagged: {
      type: DataTypes.BOOLEAN
    },
    gear_id: {
      type: DataTypes.STRING
    },
    start_latlng: {
      type: DataTypes.GEOMETRY('POINT'),
      get() {
        return this.getDataValue('start_latlng')?.coordinates;
      }
    },
    end_latlng: {
      type: DataTypes.GEOMETRY('POINT'),
      get() {
        return this.getDataValue('end_latlng')?.coordinates;
      }
    },
    average_speed: {
      type: DataTypes.DECIMAL(6, 2),
      get() {
        return Number(this.getDataValue('average_speed'));
      }
    },
    max_speed: {
      type: DataTypes.DECIMAL(6, 2),
      get() {
        return Number(this.getDataValue('max_speed'));
      }
    },
    has_heartrate: {
      type: DataTypes.BOOLEAN
    },
    average_heartrate: {
      type: DataTypes.DECIMAL(4, 1),
      get() {
        return Number(this.getDataValue('average_heartrate'));
      }
    },
    max_heartrate: {
      type: DataTypes.SMALLINT
    },
    heartrate_opt_out: {
      type: DataTypes.BOOLEAN
    },
    display_hide_heartrate_option: {
      type: DataTypes.BOOLEAN
    },
    elev_high: {
      type: DataTypes.DECIMAL(6, 1),
      get() {
        return Number(this.getDataValue('elev_high'));
      }
    },
    elev_low: {
      type: DataTypes.DECIMAL(6, 1),
      get() {
        return Number(this.getDataValue('elev_low'));
      }
    },
    upload_id: {
      type: DataTypes.BIGINT
    },
    upload_id_str: {
      type: DataTypes.STRING(30)
    },
    external_id: {
      type: DataTypes.STRING(255)
    },
    from_accepted_tag: {
      type: DataTypes.BOOLEAN
    },
    pr_count: {
      type: DataTypes.SMALLINT
    },
    total_photo_count: {
      type: DataTypes.SMALLINT
    },
    has_kudoed: {
      type: DataTypes.BOOLEAN
    },
    summary_polyline: {
      type: DataTypes.TEXT
    },
  },
  {
    sequelize: sequelizeMysql,
    modelName: 'activities',
    tableName: 'activities',
  }
);

module.exports = Activity;

