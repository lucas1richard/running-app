const fs = require('fs');
const { Sequelize } = require('sequelize');

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

const host = HOST_FILE ? fs.readFileSync(HOST_FILE) : HOST;
const user = USER_FILE ? fs.readFileSync(USER_FILE) : USER;
const password = PASSWORD_FILE ? fs.readFileSync(PASSWORD_FILE) : PASSWORD;
const database = DB_FILE ? fs.readFileSync(DB_FILE) : DB;

const sequelize = new Sequelize(database, user, password, {
  host,
  dialect: 'mysql',
  define: {
    defaultScope: {
      exclude: ['createdAt', 'updatedAt'],
    },
  },
});

sequelize
  .authenticate()
  .then(() => console.log('Connection has been established successfully.'))
  .catch((err) => console.error('Unable to connect to the database:', err));

module.exports = {
  sequelizeMysql: sequelize,
};
