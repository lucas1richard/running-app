SELECT
  `activities`.*
  -- `zonesCaches`.`activityId` AS `zonesCaches.activityId`,
  -- `zonesCaches`.`seconds_z1` AS `zonesCaches.seconds_z1`,
  -- `zonesCaches`.`seconds_z2` AS `zonesCaches.seconds_z2`,
  -- `zonesCaches`.`seconds_z3` AS `zonesCaches.seconds_z3`,
  -- `zonesCaches`.`seconds_z4` AS `zonesCaches.seconds_z4`,
  -- `zonesCaches`.`seconds_z5` AS `zonesCaches.seconds_z5`,
  -- `zonesCaches`.`heartZoneId` AS `zonesCaches.heartZoneId`,
  -- `weather`.`id` AS `weather.id`,
  -- `weather`.`sky` AS `weather.sky`,
  -- `weather`.`precipitation` AS `weather.precipitation`,
  -- `weather`.`temperature` AS `weather.temperature`,
  -- `weather`.`temperature_unit` AS `weather.temperature_unit`,
  -- `weather`.`humidity` AS `weather.humidity`,
  -- `weather`.`wind` AS `weather.wind`,
  -- `calculatedBestEfforts`.`start_date_local` AS `calculatedBestEfforts.start_date_local`,
  -- `calculatedBestEfforts`.`distance` AS `calculatedBestEfforts.distance`,
  -- `calculatedBestEfforts`.`elapsed_time` AS `calculatedBestEfforts.elapsed_time`,
  -- `calculatedBestEfforts`.`moving_time` AS `calculatedBestEfforts.moving_time`,
  -- `calculatedBestEfforts`.`pr_rank` AS `calculatedBestEfforts.pr_rank`,
  -- `calculatedBestEfforts`.`name` AS `calculatedBestEfforts.name`,
  -- `calculatedBestEfforts`.`start_index` AS `calculatedBestEfforts.start_index`,
  -- `calculatedBestEfforts`.`end_index` AS `calculatedBestEfforts.end_index`,
  -- `calculatedBestEfforts`.`activityId` AS `calculatedBestEfforts.activityId`,
  -- `calculatedBestEfforts`.`createdAt` AS `calculatedBestEfforts.createdAt`,
  -- `calculatedBestEfforts`.`updatedAt` AS `calculatedBestEfforts.updatedAt`,
  -- `stream_pins`.`id` AS `stream_pins.id`,
  -- `stream_pins`.`stream_key` AS `stream_pins.stream_key`,
  -- `stream_pins`.`index` AS `stream_pins.index`,
  -- `stream_pins`.`label` AS `stream_pins.label`,
  -- `stream_pins`.`description` AS `stream_pins.description`,
  -- `stream_pins`.`latlng` AS `stream_pins.latlng`,
  -- `stream_pins`.`activityId` AS `stream_pins.activityId`
  FROM (
    SELECT `activities`.`id`,
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
    -- `activities`.`summary_polyline`,
    `activities`.`hidden`,
    `activities`.`createdAt`,
    `activities`.`updatedAt`
    FROM `activities` AS `activities`
    WHERE (`activities`.`hidden` = false OR `activities`.`hidden` IS NULL)
      AND (
        `activities`.`sport_type` = :sportType
        AND ST_Distance(`start_latlng`, Point(:lat, :lon)) <= :compressionLevel
        AND `activities`.`distance` BETWEEN :minDistance AND :maxDistance
        AND `activities`.`elapsed_time` BETWEEN :minTime AND :maxTime
      )
      AND NOT (
        `activities`.`id` = :baseActivityId
        AND NOT EXISTS (
          SELECT 1 FROM related_activities_n as RelatedActivities
          WHERE RelatedActivities.baseActivity = :baseActivityId
          AND RelatedActivities.relatedActivity = activities.id
        )
      )
    AND `activities`.`sport_type` = :sportType ORDER BY `activities`.`start_date_local` DESC LIMIT :maxCount
  ) AS `activities`
-- LEFT OUTER JOIN `zones_cache` AS `zonesCaches` ON `activities`.`id` = `zonesCaches`.`activityId`
-- LEFT OUTER JOIN `weather` AS `weather` ON `activities`.`id` = `weather`.`activityId`
-- LEFT OUTER JOIN `calculated_best_efforts` AS `calculatedBestEfforts` ON `activities`.`id` = `calculatedBestEfforts`.`activityId`
-- LEFT OUTER JOIN `stream_pins` AS `stream_pins` ON `activities`.`id` = `stream_pins`.`activityId`
ORDER BY `activities`.`start_date_local` DESC;
