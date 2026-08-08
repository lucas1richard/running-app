import fs from 'fs';
import path from 'path';

const getSqlFile = (filePath) => {
  const str = fs.readFileSync(path.join(import.meta.dirname, filePath), 'utf8');
  if (!str) {
    throw new Error(`SQL file ${filePath} not found or is empty`);
  }
  return str;
}

const getActivitiesSql = getSqlFile('getActivities.sql');
const getActivitiesInBoundsSql = getSqlFile('getActivitiesInBounds.sql');
const getUnroutedActivitiesSql = getSqlFile('getUnroutedActivities.sql');
const getActivitiesByIdSql = getSqlFile('getActivitiesById.sql');
const getHeatMapByTimeframeSql = getSqlFile('getHeatMapByTimeframe.sql');
const getHeatMapSql = getSqlFile('getHeatMap.sql');
const getPRsSql = getSqlFile('getPRs.sql');

export {
  getActivitiesSql,
  getActivitiesInBoundsSql,
  getUnroutedActivitiesSql,
  getActivitiesByIdSql,
  getHeatMapByTimeframeSql,
  getHeatMapSql,
  getPRsSql,
};
