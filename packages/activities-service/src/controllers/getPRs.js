const { query } = require('../persistence/mysql-promise');
const { getPRsSql } = require('../persistence/sql-queries');

const getPRs = async () => {
  const prs = await query(getPRsSql);

  return prs;
};

module.exports = getPRs;