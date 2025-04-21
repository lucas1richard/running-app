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
          b.start_date_local DESC
      ) as row_num
    FROM
      calculated_best_efforts AS b
      JOIN activities AS a ON activityId = a.id
    WHERE
      pr_rank = 1
      AND hidden IS NOT TRUE
  ) subquery
WHERE
  row_num = 1
ORDER BY
  distance DESC