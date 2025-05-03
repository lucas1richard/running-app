const fs = require('fs');
const path = require('path');

const getSqlFile = (filePath) => {
  const str = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
  if (!str) {
    throw new Error(`SQL file ${filePath} not found or is empty`);
  }
  return str;
}

module.exports = {
  addCompressedRouteSql: getSqlFile('addCompressedRoute.sql'),
  createDatabaseSql: getSqlFile('createDatabase.sql'),
  createTokenTableSql: getSqlFile('createTokensTable.sql'),
  deleteTokenDataSql: getSqlFile('deleteTokenData.sql'),
  insertActivitiesSql: getSqlFile('insertActivities.sql'),
  insertBestEffortsSql: getSqlFile('insertBestEfforts.sql'),
  insertHeartRateZonesCacheSql: getSqlFile('insertHeartRateZonesCache.sql'),
  insertStravaBestEffortsSql: getSqlFile('insertStravaBestEfforts.sql'),
  insertTokenDataSql: getSqlFile('insertTokenData.sql'),
  selectActivitiesMultiSql: getSqlFile('selectActivitiesMulti.sql'),
  selectActivitiesWithoutBestEffortsSql: getSqlFile('selectActivitiesWithoutBestEfforts.sql'),
  selectExistingBestEffortActivityIdsSql: getSqlFile('selectExistingBestEffortActivityIds.sql'),
  selectHeartZonesAtDateSql: getSqlFile('selectHeartZonesAtDate.sql'),
  selectMostRecentBestEffortsSql: getSqlFile('selectMostRecentBestEfforts.sql'),
  selectTokenDataSql: getSqlFile('selectTokenData.sql'),
  updateTokenDataSql: getSqlFile('updateTokenData.sql'),
};
