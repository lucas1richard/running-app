select
  *
from
  heartrate_zones
where
  start_date < ?
order by
  start_date desc
limit
  1;