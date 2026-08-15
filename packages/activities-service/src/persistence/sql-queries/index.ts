import fs from 'fs';
import path from 'path';

const getSqlFile = (filePath) => {
  const str = fs.readFileSync(path.join(import.meta.dirname, filePath), 'utf8');
  if (!str) {
    throw new Error(`SQL file ${filePath} not found or is empty`);
  }
  return str;
};

const addCompressedRouteSql = getSqlFile('addCompressedRoute.sql');
const getActivitiesSql = getSqlFile('getActivities.sql');
const insertActivitiesSql = getSqlFile('insertActivities.sql');
const insertBestEffortsSql = getSqlFile('insertBestEfforts.sql');
const insertHeartRateZonesCacheSql = getSqlFile('insertHeartRateZonesCache.sql');
const selectHeartZonesAtDateSql = getSqlFile('selectHeartZonesAtDate.sql');
const getActivitiesInBoundsSql = getSqlFile('getActivitiesInBounds.sql');
const getUnroutedActivitiesSql = getSqlFile('getUnroutedActivities.sql');
const getActivitiesByIdSql = getSqlFile('getActivitiesById.sql');
const getHeatMapByTimeframeSql = getSqlFile('getHeatMapByTimeframe.sql');
const getHeatMapSql = getSqlFile('getHeatMap.sql');
const getPRsSql = getSqlFile('getPRs.sql');

export {
  addCompressedRouteSql,
  getActivitiesSql,
  insertActivitiesSql,
  insertBestEffortsSql,
  insertHeartRateZonesCacheSql,
  getActivitiesInBoundsSql,
  getUnroutedActivitiesSql,
  getActivitiesByIdSql,
  getHeatMapByTimeframeSql,
  getHeatMapSql,
  getPRsSql,
  selectHeartZonesAtDateSql,
};
