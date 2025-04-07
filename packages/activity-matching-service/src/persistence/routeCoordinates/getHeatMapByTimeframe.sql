SELECT * FROM (SELECT
  lat,
  lon,
  SUM(seconds_at_coords + 1) AS total_seconds
FROM
  route_coordinates_n
  LEFT OUTER JOIN activities ON `activities`.`id` = `route_coordinates_n`.`activityId`
WHERE
  `compression_level` = 0.0001
  AND `activities`.`start_date_local` > ? - INTERVAL _timeframe
  AND seconds_at_coords > 0
GROUP BY
  lat,
  lon
ORDER BY
  total_seconds ASC) AS heatmap
WHERE total_seconds > 1;