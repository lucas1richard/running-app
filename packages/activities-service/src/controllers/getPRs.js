const Activity = require('../persistence/activities/model-activities');
const BestEfforts = require('../persistence/activities/model-best-efforts');

const getPRs = async () => {
  const prs = await BestEfforts.sequelize.query(
    `SELECT * FROM (
      SELECT b.*, a.name as activity_name, ROW_NUMBER() OVER (PARTITION BY b.distance ORDER BY b.start_date_local DESC) as row_num 
        FROM ${BestEfforts.tableName} AS b
        JOIN ${Activity.tableName} AS a ON activityId = a.id
        WHERE pr_rank = 1 AND hidden IS NOT TRUE
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