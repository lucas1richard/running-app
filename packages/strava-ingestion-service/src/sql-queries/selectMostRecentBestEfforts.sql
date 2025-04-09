SELECT
  *
FROM
  (
    SELECT
      b.*,
      a.name as activity_name,
      ROW_NUMBER() OVER (
        PARTITION BY
          b.distance
        ORDER BY
          b.elapsed_time ASC
      ) as row_num
    FROM
      calculated_best_efforts AS b
      JOIN activities AS a ON activityId = a.id
    WHERE
      hidden IS NOT TRUE
      AND a.id NOT IN (?)
      AND b.start_date_local < ?
  ) subquery
WHERE
  row_num <= ?;