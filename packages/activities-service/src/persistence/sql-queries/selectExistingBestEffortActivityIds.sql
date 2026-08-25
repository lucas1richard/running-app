SELECT DISTINCT
  activityId
FROM
  calculated_best_efforts
WHERE
  activityId IN (?);