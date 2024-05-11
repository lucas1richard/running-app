const getMySQLConnection = require('./mysql-connection');

const createHeartRateZonesTable = async () => {
  const pool = await getMySQLConnection();
  return new Promise((acc, rej) => {
    pool.query(
      `
        CREATE TABLE IF NOT EXISTS heartrate_zones
        (
          id MEDIUMINT NOT NULL AUTO_INCREMENT,
          z1 INT,
          z2 INT,
          z3 INT,
          z4 INT,
          z5 INT,
          start_date DATE,
          PRIMARY KEY (id)
        )
        DEFAULT CHARSET utf8mb4
      `,
      (err) => {
        if (err) return rej(err);
        acc();
      }
    )
  });
};

const getAllHeartRateZones = async () => {
  const pool = await getMySQLConnection();
  return new Promise((acc, rej) => {
    pool.query(
      `SELECT * FROM heartrate_zones ORDER BY start_date DESC`,
      (err, rows) => {
        if (err) return rej(err);
        acc(rows);
      }
    )
  });
};

const addHeartRateZone = async (data) => {
  const pool = await getMySQLConnection();
  return new Promise((acc, rej) => {
    pool.query(
      `INSERT INTO heartrate_zones VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [undefined, Number(data.z1), Number(data.z2), Number(data.z3), Number(data.z4), Number(data.z5), data.starting],
      (err, rows) => {
        if (err) return rej(err);
        acc(rows);
      }
    )
  });
};

module.exports = {
  createHeartRateZonesTable,
  getAllHeartRateZones,
  addHeartRateZone,
};
