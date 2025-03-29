const waitPort = require('wait-port');
const fs = require('fs');
const mysql = require('mysql2');

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

const getMySQLConnection = async () => {
  if (pool) return pool;

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

  return pool;
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

module.exports = {
  getMySQLConnection,
  queryStream,
};
