const { calculateBestEffortsForNewActivities } = require('./calculateBestEffortsForNewActivities');
const { query } = require('./mysql-connection');
const { insertStravaBestEffortsSql } = require('./sql-queries');

/*
+------------------+--------------+------+-----+---------+-------+
| Field            | Type         | Null | Key | Default | Extra |
+------------------+--------------+------+-----+---------+-------+
| effort_id        | bigint       | NO   | PRI | NULL    |       |
| start_date_local | datetime     | YES  |     | NULL    |       |
| distance         | float        | YES  |     | NULL    |       |
| elapsed_time     | int          | YES  |     | NULL    |       |
| moving_time      | int          | YES  |     | NULL    |       |
| pr_rank          | int          | YES  |     | NULL    |       |
| name             | varchar(255) | YES  |     | NULL    |       |
| start_index      | int          | YES  |     | NULL    |       |
| end_index        | int          | YES  |     | NULL    |       |
| createdAt        | datetime     | NO   |     | NULL    |       |
| updatedAt        | datetime     | NO   |     | NULL    |       |
| activityId       | bigint       | YES  | MUL | NULL    |       |
+------------------+--------------+------+-----+---------+-------+
*/



const addBestEffortsForActivity = async (activityId, bestEfforts) => {
  await query(insertStravaBestEffortsSql, [
    bestEfforts.filter(({ pr_rank }) => !!pr_rank).map((effort) => [
      effort.id,
      effort.start_date_local,
      effort.distance,
      effort.elapsed_time,
      effort.moving_time,
      effort.pr_rank,
      effort.name,
      effort.start_index,
      effort.end_index,
      new Date(),
      new Date(),
      activityId,
    ])
  ]);

  await calculateBestEffortsForNewActivities([activityId]);
};

module.exports = addBestEffortsForActivity;
