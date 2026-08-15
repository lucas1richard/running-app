INSERT INTO
  calculated_best_efforts (
    start_date_local,
    distance,
    elapsed_time,
    moving_time,
    pr_rank,
    name,
    start_index,
    end_index,
    activityId,
    createdAt,
    updatedAt
  )
VALUES
  ? ON DUPLICATE KEY
UPDATE name =
VALUES
  (name);