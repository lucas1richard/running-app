const getMySQLConnection = require('./mysql-connection');

const bulkAdd = async (activities) => {
  const pool = await getMySQLConnection();
  const activitiesValues = activities.map(
    (a) => `(${a.id}, "${a.name}", "${a.sport_type}", false)`
  ).join(',');
  return new Promise((acc, rej) => {
    pool.query(
      `INSERT IGNORE INTO activities VALUES ${activitiesValues}
      `,
      (err) => {
        if (err) return rej(err);
        acc();
      }
    );
  });
};

const setHasStreams = async (id, hasStreams) => {
  const pool = await getMySQLConnection();
  return new Promise((acc, rej) => {
    pool.query(
      `UPDATE activities SET
        has_streams=?
      WHERE id=?
      `,
      [hasStreams, id],
      (err) => {
        if (err) return rej(err);
        acc();
      }
    );
  });
};

const getAll = async () => {
  const pool = await getMySQLConnection();
  return new Promise((acc, rej) => {
    pool.query(
      `SELECT * FROM activities
      `,
      (err, rows) => {
        if (err) return rej(err);
        const objectRows = Object.fromEntries(rows.map((row) => [row.id, row]));
        acc(objectRows);
      }
    );
  });
};

module.exports = {
  bulkAdd,
  getAll,
  setHasStreams,
};
