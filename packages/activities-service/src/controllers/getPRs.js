const BestEfforts = require('../persistence/activities/model-best-efforts');

const getPRs = async () => {
  const prs = await BestEfforts.sequelize.query(
    `SELECT * FROM (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY name ORDER BY start_date_local DESC) as row_num
      FROM ${BestEfforts.tableName}
      WHERE pr_rank = 1
    ) subquery
    WHERE row_num = 1
    ORDER BY distance DESC`,
    {
      model: BestEfforts,
      mapToModel: true,
    }
  );

  return prs;
};

module.exports = getPRs;