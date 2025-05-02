SELECT
  id
FROM
  activities
WHERE
  id NOT IN (
    SELECT distinct
      activityId
    FROM
      compressed_routes
  )
  -- AND sport_type = "Run"
  AND (
    `hidden` = false
    OR `hidden` IS NULL
  );