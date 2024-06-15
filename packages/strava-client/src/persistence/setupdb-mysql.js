const waitPort = require('wait-port');
const fs = require('fs');
const mysql = require('mysql2');
const { createHeartRateZonesTable } = require('./heartzones');

const {
    MYSQL_HOST: HOST,
    MYSQL_HOST_FILE: HOST_FILE,
    MYSQL_USER: USER,
    MYSQL_USER_FILE: USER_FILE,
    MYSQL_PASSWORD: PASSWORD,
    MYSQL_PASSWORD_FILE: PASSWORD_FILE,
    MYSQL_DB: DB,
    MYSQL_DB_FILE: DB_FILE,
} = process.env;

let pool;

const createTokensTable = (dbPool) => new Promise((acc, rej) => {
  dbPool.query(
      `
      CREATE TABLE IF NOT EXISTS tokens
      (
        id MEDIUMINT NOT NULL AUTO_INCREMENT,
        access_token varchar(255),
        refresh_token varchar(255),
        expires int,
        PRIMARY KEY (id)
      )
      DEFAULT CHARSET utf8mb4
      `,
      (err) => {
          if (err) return rej(err);
          acc();
      }
  );
});

async function initMysql() {
  const host = HOST_FILE ? fs.readFileSync(HOST_FILE) : HOST;
  const user = USER_FILE ? fs.readFileSync(USER_FILE) : USER;
  const password = PASSWORD_FILE ? fs.readFileSync(PASSWORD_FILE) : PASSWORD;
  const database = DB_FILE ? fs.readFileSync(DB_FILE) : DB;

  await waitPort({ 
      host, 
      port: 3306,
      timeout: 10000,
      waitForDns: true,
  });

  pool = mysql.createPool({
    connectionLimit: 5,
    host,
    user,
    password,
    database,
    charset: 'utf8mb4',
  });

  try {
    await pool.query(
      'CREATE DATABASE IF NOT EXISTS strava_tokens',
      err => {
        if (err) return console.error(err);
    });
  } catch (err) {
    console.log(err);
  }

  await Promise.all([
    createTokensTable(pool),
    createHeartRateZonesTable()
  ]);

  console.log(`Connected to mysql db at host ${HOST}`);
}

async function getItem(id) {
  return new Promise((acc, rej) => {
      pool.query('SELECT * FROM tokens WHERE id=?', [id], (err, rows) => {
          if (err) return rej(err);
          acc(rows[0]);
      });
  });
}

async function storeItem(item, id) {
  return new Promise((acc, rej) => {
      pool.query(
          `
          INSERT INTO tokens
          (
            id,
            access_token,
            refresh_token,
            expires
          )
          VALUES (?, ?, ?, ?)
          `,
          [id, item.access_token, item.refresh_token, item.expires_at],
          err => {
              if (err) return rej(err);
              acc();
          },
      );
  });
}

async function upsertItem(item) {
  const record = await getItem(1);
  if (record) {
    return await updateItem(1, item)
  } else {
    return await storeItem(item)
  }
}

async function updateItem(id, item) {
  return new Promise((acc, rej) => {
      pool.query(
          'UPDATE tokens SET access_token=?, refresh_token=?, expires=? WHERE id=?',
          [item.access_token, item.refresh_token, item.expires_at, id],
          err => {
              if (err) return rej(err);
              acc();
          },
      );
  });
}

async function removeItem(id) {
  return new Promise((acc, rej) => {
      pool.query('DELETE FROM tokens WHERE id=?', [id], err => {
          if (err) return rej(err);
          acc();
      });
  });
}

module.exports = {
  initMysql,
  getItem,
  storeItem,
  updateItem,
  removeItem,
  upsertItem,
};