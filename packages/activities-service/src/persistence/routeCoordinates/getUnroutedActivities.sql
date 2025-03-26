SELECT
  id
FROM
  activities
WHERE
  id NOT IN (
    SELECT distinct
      activityId
    FROM
      route_coordinates_n
  )
  AND
  sport_type = "run"
  AND (`hidden` = false OR `hidden` IS NULL);
