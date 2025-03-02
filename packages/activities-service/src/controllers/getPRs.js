const Activity = require('../persistence/activities/model-activities');
const CalculatedBestEfforts = require('../persistence/activities/model-calculated-efforts');

const getPRs = async () => {
  const prs = await CalculatedBestEfforts.sequelize.query(
    `SELECT * FROM (
      SELECT b.*, a.name as activity_name, ROW_NUMBER() OVER (PARTITION BY b.distance ORDER BY b.start_date_local DESC) as row_num 
        FROM ${CalculatedBestEfforts.tableName} AS b
        JOIN ${Activity.tableName} AS a ON activityId = a.id
        WHERE pr_rank = 1 AND hidden IS NOT TRUE
    ) subquery
     WHERE row_num = 1
    ORDER BY distance DESC`,
    {
      model: CalculatedBestEfforts,
      mapToModel: true,
    }
  );

  return prs;
};

module.exports = getPRs;