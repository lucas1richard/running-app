import { query } from '../persistence/mysql-promise.ts';
import { getPRsSql } from '../persistence/sql-queries/index.ts';

const getPRs = async () => {
  const prs = await query(getPRsSql);

  return prs;
};

export default getPRs;