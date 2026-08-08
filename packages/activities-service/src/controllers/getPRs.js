import { query } from '../persistence/mysql-promise.js';
import { getPRsSql } from '../persistence/sql-queries/index.js';

const getPRs = async () => {
  const prs = await query(getPRsSql);

  return prs;
};

export default getPRs;