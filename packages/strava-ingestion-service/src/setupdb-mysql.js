const { query } = require('./mysql-connection');

async function initMysql() {
  try {
    await query('CREATE DATABASE IF NOT EXISTS strava_tokens');
    await query(
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
        `
    );
  } catch (err) {
    console.log(err);
  }
}

async function getItem(id) {
  return query('SELECT * FROM tokens WHERE id=?', [id]);
}

async function storeItem(item, id) {
  return query('INSERT INTO tokens (id, access_token, refresh_token, expires) VALUES (?, ?, ?, ?)',
  [id, item.access_token, item.refresh_token, item.expires_at]
);
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
  return query(
    'UPDATE tokens SET access_token=?, refresh_token=?, expires=? WHERE id=?',
    [item.access_token, item.refresh_token, item.expires_at, id]
  );
}

async function removeItem(id) {
  return query('DELETE FROM tokens WHERE id=?', [id]);
}

module.exports = {
  initMysql,
  getItem,
  storeItem,
  updateItem,
  removeItem,
  upsertItem,
};