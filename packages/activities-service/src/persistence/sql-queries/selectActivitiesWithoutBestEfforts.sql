SELECT
  id,
  start_date_local,
  sport_type
FROM
  activities
WHERE
  (id IN (?))
  AND NOT (id IN (?))
  AND sport_type = "Run"
ORDER BY
  start_date_local ASC;