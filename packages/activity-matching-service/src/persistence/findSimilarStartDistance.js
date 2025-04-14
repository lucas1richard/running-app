const path = require('path');
const fs = require('fs');
const { getMySQLConnection } = require('./mysql-connection');

const findBySimilarStartDistanceSql = fs.readFileSync(path.join(__dirname, '/findBySimilarStartDistance.sql'), 'utf8');

const findSimilarStartDistance = async (activityId, maxCount = 100) => {
  const conn = await getMySQLConnection();
  // const [[activity]] = await conn.query('SELECT * FROM activities WHERE id = ? limit 1', [activityId]);
  const [[activity]] = await conn.query('SELECT id, distance, elapsed_time, sport_type, start_latlng FROM activities WHERE id = ? limit 1', [activityId]);

  console.trace(activity)

  const distanceDelta = Math.max(Number(activity.distance) * 0.1, 200);
  const timeDelta = Math.max(Number(activity.elapsed_time) * 0.1, 300);

  const parameters = {
    baseActivityId: activity.id,
    minDistance: Number(activity.distance) - distanceDelta,
    maxDistance: Number(activity.distance) + distanceDelta,
    minTime: Number(activity.elapsed_time) - timeDelta,
    maxTime: Number(activity.elapsed_time) + timeDelta,
    sportType: activity.sport_type,
    lat: Number(activity.start_latlng.x),
    lon: Number(activity.start_latlng.y),
    compressionLevel: 0.0001,
    maxCount,
  }
  return conn.query(findBySimilarStartDistanceSql, parameters);
};

// findSimilarStartDistance('14053639538', 100)
//   .then(console.trace)
//   .catch(console.error);

module.exports = findSimilarStartDistance;
