SELECT * FROM (SELECT
  lat,
  lon,
  sport_type as sportType,
  SUM(seconds_at_coords + 1) AS total_seconds
FROM
  compressed_routes
  LEFT OUTER JOIN activities ON `activities`.`id` = `compressed_routes`.`activityId`
WHERE
  `compression_level` = 0.0001
  AND `activities`.`start_date_local` > ? - INTERVAL _timeframe
  AND seconds_at_coords > 0
  AND `activities`.`sport_type` LIKE _sportType
GROUP BY
  lat,
  lon,
  sportType
ORDER BY
  total_seconds ASC) AS heatmap
WHERE total_seconds > 1;