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
  getActivitiesSql: getSqlFile('getActivities.sql'),
  getActivitiesByIdSql: getSqlFile('getActivitiesById.sql'),
  getHeatMapByTimeframeSql: getSqlFile('getHeatMapByTimeframe.sql'),
  getHeatMapSql: getSqlFile('getHeatMap.sql'),
  getPRsSql: getSqlFile('getPRs.sql'),
};
