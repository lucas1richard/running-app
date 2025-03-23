const { getMySQLConnection } = require('./mysql-connection');

const setHasStreams = async (id, hasStreams) => {
  const pool = await getMySQLConnection();
  return new Promise((acc, rej) => {
    pool.query(
      `UPDATE activity SET
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
      `SELECT * FROM activity ORDER BY start_date
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
  getAll,
  setHasStreams,
};
