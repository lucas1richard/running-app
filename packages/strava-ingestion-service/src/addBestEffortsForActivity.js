const { calculateBestEffortsForNewActivities } = require('./calculateBestEffortsForNewActivities');
const { getMySQLConnection } = require('./mysql-connection');

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
  const connection = await getMySQLConnection();

  await connection.query(`
    INSERT INTO best_efforts (
      effort_id, start_date_local, distance, elapsed_time, moving_time, pr_rank, name, start_index, end_index, createdAt, updatedAt, activityId
    ) values ?
  `, [
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
