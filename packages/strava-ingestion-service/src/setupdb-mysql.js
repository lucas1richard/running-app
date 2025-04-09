const { query } = require('./mysql-connection');
const {
  createTokenTableSql,
  createDatabaseSql,
  selectTokenDataSql,
  insertTokenDataSql,
  updateTokenDataSql,
  deleteTokenDataSql,
} = require('./sql-queries');

const initMysql = async () => {
  await query(createDatabaseSql);
  await query(createTokenTableSql);
}

const getItem = async (id) => {
  const q = await query(selectTokenDataSql, [id]);
  return q[0];
}

const storeItem = async (item, id) => query(
  insertTokenDataSql, [id, item.access_token, item.refresh_token, item.expires_at]
);

const upsertItem = async (item) => {
  const record = await getItem(1);
  if (record) return await updateItem(1, item);
  else return await storeItem(item);
}

const updateItem = async (id, item) => query(
  updateTokenDataSql, [item.access_token, item.refresh_token, item.expires_at, id]
);

const removeItem = async (id) => query(deleteTokenDataSql, [id]);

module.exports = {
  initMysql,
  getItem,
  storeItem,
  updateItem,
  removeItem,
  upsertItem,
};