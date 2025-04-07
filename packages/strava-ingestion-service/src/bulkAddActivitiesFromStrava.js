const fs = require('fs');
const { getMySQLConnection, query } = require('./mysql-connection');

const sql = fs.readFileSync(__dirname + '/insertActivities.sql', 'utf8');

/*

+-------------------------------+--------------+------+-----+---------+-------+
| Field                         | Type         | Null | Key | Default | Extra |
+-------------------------------+--------------+------+-----+---------+-------+
| id                            | bigint       | NO   | PRI | NULL    |       |
| activity_name                 | varchar(255) | YES  |     | NULL    |       |
| has_streams                   | tinyint(1)   | YES  |     | NULL    |       |
| name                          | varchar(255) | YES  |     | NULL    |       |
| distance                      | decimal(7,2) | YES  |     | NULL    |       |
| moving_time                   | mediumint    | YES  |     | NULL    |       |
| elapsed_time                  | mediumint    | YES  |     | NULL    |       |
| total_elevation_gain          | decimal(7,2) | YES  |     | NULL    |       |
| type                          | varchar(100) | YES  |     | NULL    |       |
| sport_type                    | varchar(100) | YES  |     | NULL    |       |
| start_date                    | datetime     | YES  |     | NULL    |       |
| start_date_local              | datetime     | YES  |     | NULL    |       |
| timezone                      | varchar(255) | YES  |     | NULL    |       |
| utc_offset                    | mediumint    | YES  |     | NULL    |       |
| location_city                 | varchar(255) | YES  |     | NULL    |       |
| location_state                | varchar(255) | YES  |     | NULL    |       |
| location_country              | varchar(255) | YES  |     | NULL    |       |
| achievement_count             | smallint     | YES  |     | NULL    |       |
| kudos_count                   | smallint     | YES  |     | NULL    |       |
| comment_count                 | smallint     | YES  |     | NULL    |       |
| athlete_count                 | smallint     | YES  |     | NULL    |       |
| photo_count                   | smallint     | YES  |     | NULL    |       |
| trainer                       | tinyint(1)   | YES  |     | NULL    |       |
| commute                       | tinyint(1)   | YES  |     | NULL    |       |
| manual                        | tinyint(1)   | YES  |     | NULL    |       |
| private                       | tinyint(1)   | YES  |     | NULL    |       |
| visibility                    | varchar(100) | YES  |     | NULL    |       |
| flagged                       | tinyint(1)   | YES  |     | NULL    |       |
| gear_id                       | varchar(255) | YES  |     | NULL    |       |
| start_latlng                  | point        | NO   | MUL | NULL    |       |
| end_latlng                    | point        | YES  |     | NULL    |       |
| average_speed                 | decimal(6,2) | YES  |     | NULL    |       |
| max_speed                     | decimal(6,2) | YES  |     | NULL    |       |
| has_heartrate                 | tinyint(1)   | YES  |     | NULL    |       |
| average_heartrate             | decimal(4,1) | YES  |     | NULL    |       |
| max_heartrate                 | smallint     | YES  |     | NULL    |       |
| heartrate_opt_out             | tinyint(1)   | YES  |     | NULL    |       |
| display_hide_heartrate_option | tinyint(1)   | YES  |     | NULL    |       |
| elev_high                     | decimal(6,1) | YES  |     | NULL    |       |
| elev_low                      | decimal(6,1) | YES  |     | NULL    |       |
| upload_id                     | bigint       | YES  |     | NULL    |       |
| upload_id_str                 | varchar(30)  | YES  |     | NULL    |       |
| external_id                   | varchar(255) | YES  |     | NULL    |       |
| from_accepted_tag             | tinyint(1)   | YES  |     | NULL    |       |
| pr_count                      | smallint     | YES  |     | NULL    |       |
| total_photo_count             | smallint     | YES  |     | NULL    |       |
| has_kudoed                    | tinyint(1)   | YES  |     | NULL    |       |
| summary_polyline              | text         | YES  |     | NULL    |       |
| createdAt                     | datetime     | NO   |     | NULL    |       |
| updatedAt                     | datetime     | NO   |     | NULL    |       |
| hidden                        | tinyint(1)   | YES  |     | NULL    |       |
+-------------------------------+--------------+------+-----+---------+-------+

*/

const bulkAddActivitiesFromStrava = async (stravaActivities) => {
  if (stravaActivities.length > 0) {
    try {
      const connection = await getMySQLConnection();
      const [existingRecords] = await connection.query('select id from activities where id in (?)', [stravaActivities.map(a => a.id)]);

      const existingMap = existingRecords.reduce((a, r) => {
        a[r.id] = true;
        return a;
      }, {});


      const newActivities = stravaActivities.filter(a => !existingMap[a.id]).map((av) => ([
        av.id,
        av.activity_name,
        av.has_streams,
        av.name,
        av.distance,
        av.moving_time,
        av.elapsed_time,
        av.total_elevation_gain,
        av.type,
        av.sport_type,
        new Date(av.start_date),
        new Date(av.start_date_local),
        av.timezone,
        av.utc_offset,
        av.location_city,
        av.location_state,
        av.location_country,
        av.achievement_count,
        av.kudos_count,
        av.comment_count,
        av.athlete_count,
        av.photo_count,
        av.trainer,
        av.commute,
        av.manual,
        av.private,
        av.visibility,
        av.flagged,
        av.gear_id,
        { toSqlString: () => `Point(${connection.escape(av.start_latlng[0])}, ${connection.escape(av.start_latlng[1])})` },
        { toSqlString: () => `Point(${connection.escape(av.end_latlng[0])}, ${connection.escape(av.end_latlng[1])})` },
        av.average_speed,
        av.max_speed,
        av.has_heartrate,
        av.average_heartrate,
        av.max_heartrate,
        av.heartrate_opt_out,
        av.display_hide_heartrate_option,
        av.elev_high,
        av.elev_low,
        av.upload_id,
        av.upload_id_str,
        av.external_id,
        av.from_accepted_tag,
        av.pr_count,
        av.total_photo_count,
        av.has_kudoed,
        av.map?.summary_polyline || null,
        { toSqlString: () => `NOW()` },
        { toSqlString: () => `NOW()` },
        av.hidden,
      ]));

      if (newActivities.length === 0) {
        console.log('No new activities to add');
        return [];
      }

      await connection.query(
        sql,
        [newActivities]
      );

      console.log(`Bulk Add Activities Complete - ${newActivities.length} new records`);

      return query('select * from activities where id in (?)', [newActivities.map(a => a[0])]);
    } catch (err) {
      console.log(err);
      return [];
    }
  }
};

module.exports = bulkAddActivitiesFromStrava;
