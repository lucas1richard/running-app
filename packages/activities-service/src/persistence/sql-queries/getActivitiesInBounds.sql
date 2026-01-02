SELECT
  a.*
FROM
  activities a
  JOIN 
  (
    SELECT
      *
    FROM
      compressed_routes
    WHERE
      lat <= ?
      AND lat >= ?
      AND lon <= ?
      AND lon >= ?
    GROUP BY
      activityId
  )
   rc ON a.id = rc.activityId
WHERE
  a.hidden IS null
  AND a.sport_type IN ('Run')
ORDER BY
  a.start_date_local DESC