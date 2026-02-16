SELECT
  `activities`.`id`,
  `activities`.`has_streams`,
  `activities`.`name`,
  `activities`.`distance`,
  `activities`.`moving_time`,
  `activities`.`elapsed_time`,
  `activities`.`total_elevation_gain`,
  `activities`.`type`,
  `activities`.`sport_type`,
  `activities`.`start_date`,
  `activities`.`start_date_local`,
  `activities`.`timezone`,
  `activities`.`utc_offset`,
  `activities`.`location_city`,
  `activities`.`location_state`,
  `activities`.`location_country`,
  `activities`.`achievement_count`,
  `activities`.`kudos_count`,
  `activities`.`comment_count`,
  `activities`.`athlete_count`,
  `activities`.`photo_count`,
  `activities`.`trainer`,
  `activities`.`commute`,
  `activities`.`manual`,
  `activities`.`private`,
  `activities`.`visibility`,
  `activities`.`flagged`,
  `activities`.`gear_id`,
  `activities`.`start_latlng`,
  `activities`.`end_latlng`,
  `activities`.`average_speed`,
  `activities`.`max_speed`,
  `activities`.`has_heartrate`,
  `activities`.`average_heartrate`,
  `activities`.`max_heartrate`,
  `activities`.`heartrate_opt_out`,
  `activities`.`display_hide_heartrate_option`,
  `activities`.`elev_high`,
  `activities`.`elev_low`,
  `activities`.`upload_id`,
  `activities`.`upload_id_str`,
  `activities`.`external_id`,
  `activities`.`from_accepted_tag`,
  `activities`.`pr_count`,
  `activities`.`total_photo_count`,
  `activities`.`has_kudoed`,
  `activities`.`summary_polyline`,
  `activities`.`hidden`,
  `activities`.`createdAt`,
  `activities`.`updatedAt`,
  `activities`.`distance` / 1609 AS `distance_miles`,
  `activities`.`moving_time` / (`activities`.`distance` / 1609) AS `average_seconds_per_mile`,
  (SELECT JSON_ARRAYAGG(
    JSON_OBJECT(
      'activityId', `zonesCachesA`.`activityId`,
      'seconds_z1', `zonesCachesA`.`seconds_z1`,
      'seconds_z2', `zonesCachesA`.`seconds_z2`,
      'seconds_z3', `zonesCachesA`.`seconds_z3`,
      'seconds_z4', `zonesCachesA`.`seconds_z4`,
      'seconds_z5', `zonesCachesA`.`seconds_z5`,
      'heartZoneId', `zonesCachesA`.`heartZoneId`
    )
    ) FROM `zones_cache` AS `zonesCachesA`
    WHERE `zonesCachesA`.`activityId` = `activities`.`id`
  ) AS `zonesCaches`,
  (SELECT JSON_ARRAYAGG(
    JSON_OBJECT(
      'id', `hourly_weather_sub`.`id`,
      'apparent_temperature', `hourly_weather_sub`.`apparent_temperature`,
      'apparent_temperature_f', round(`hourly_weather_sub`.`apparent_temperature` * 9/5 + 32),
      'cloud_cover', `hourly_weather_sub`.`cloud_cover`,
      'dew_point_2m', `hourly_weather_sub`.`dew_point_2m`,
      'precipitation', `hourly_weather_sub`.`precipitation`,
      'relative_humidity_2m', `hourly_weather_sub`.`relative_humidity_2m`,
      'temperature_2m', `hourly_weather_sub`.`temperature_2m`,
      'temperature_2m_f', round(`hourly_weather_sub`.`temperature_2m` * 9/5 + 32),
      'time', `hourly_weather_sub`.`time`,
      'weather_code', `hourly_weather_sub`.`weather_code`,
      'wind_gusts_10m', `hourly_weather_sub`.`wind_gusts_10m`,
      'wind_speed_10m', `hourly_weather_sub`.`wind_speed_10m`,
      'activityId', `hourly_weather_sub`.`activityId`
    )
  ) FROM `hourly_weather` AS `hourly_weather_sub`
    WHERE `hourly_weather_sub`.`activityId` = `activities`.`id`
    GROUP BY `hourly_weather_sub`.`activityId`
    ORDER BY `hourly_weather_sub`.`time` ASC
  ) AS `hourly_weather`,
  (SELECT JSON_ARRAYAGG(
    JSON_OBJECT(
      'activityId', `calculatedBestEffortsA`.`activityId`,
      'start_date_local', `calculatedBestEffortsA`.`start_date_local`,
      'distance', `calculatedBestEffortsA`.`distance`,
      'elapsed_time', `calculatedBestEffortsA`.`elapsed_time`,
      'moving_time', `calculatedBestEffortsA`.`moving_time`,
      'pr_rank', `calculatedBestEffortsA`.`pr_rank`,
      'name', `calculatedBestEffortsA`.`name`,
      'start_index', `calculatedBestEffortsA`.`start_index`,
      'end_index', `calculatedBestEffortsA`.`end_index`
    )
  ) FROM `calculated_best_efforts` AS `calculatedBestEffortsA`
    WHERE `calculatedBestEffortsA`.`activityId` = `activities`.`id`
    GROUP BY `calculatedBestEffortsA`.`activityId`
    ORDER BY `calculatedBestEffortsA`.`distance` DESC
  ) AS `calculatedBestEfforts`
FROM
  `activities` AS `activities`
  LEFT OUTER JOIN `zones_cache` AS `zonesCachesA` ON `activities`.`id` = `zonesCachesA`.`activityId`
  LEFT OUTER JOIN `hourly_weather` AS `hourly_weather` ON `activities`.`id` = `hourly_weather`.`activityId`
  LEFT OUTER JOIN `calculated_best_efforts` AS `calculatedBestEffortsA` ON `activities`.`id` = `calculatedBestEffortsA`.`activityId`
WHERE
  (`activities`.`hidden` = false OR `activities`.`hidden` IS NULL)
  -- AND `activities`.`sport_type` = 'Run'
GROUP BY
  `activities`.`id`, `zonesCachesA`.`activityId`, `hourly_weather`.`activityId`, `calculatedBestEffortsA`.`activityId`
ORDER BY
  `activities`.`start_date` DESC
;
