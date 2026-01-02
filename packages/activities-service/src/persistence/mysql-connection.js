const waitPort = require('wait-port');
const fs = require('fs');
const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');

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

/** @type {import('mysql2').Pool} */
let pool;
/** @type {import('mysql2/promise').Pool} */
let promisePool;

const getMySQLConnection = async (withPromise) => {
  if (!withPromise && pool) return pool;
  if (withPromise && promisePool) return promisePool;

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

  if (!withPromise) {
    pool = mysql.createPool({
      connectionLimit: 5,
      host,
      user,
      password,
      database,
      charset: 'utf8mb4',
    });
    return pool;
  } else {
    promisePool = mysqlPromise.createPool({
      connectionLimit: 5,
      host,
      user,
      password,
      database,
      charset: 'utf8mb4',
    });
    return promisePool;
  }
};

const queryStream = async ({
  sql = '',
  queryOptions = {
    values: [],
  },
  streamOptions = { highWaterMark: 5 },
}) => {
  const connection = await getMySQLConnection();
  return connection.query(sql, queryOptions.values).stream(streamOptions);
};

const query = async (...args) => {
  const connection = await getMySQLConnection(true);
  const all = await connection.query(...args);
  return all[0] || [];
};

module.exports = {
  getMySQLConnection,
  queryStream,
  query,
};
