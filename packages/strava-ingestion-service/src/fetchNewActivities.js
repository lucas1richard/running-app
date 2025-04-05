const addBestEffortsForActivity = require('./addBestEffortsForActivity');
const bulkAddActivitiesFromStrava = require('./bulkAddActivitiesFromStrava');
const fetchStrava = require('./fetchStrava');
const { bulkAddActivities, addActivityDetail } = require('./setupdb-couchbase');

/*




SELECT DISTINCT(`activityId`) AS `activityId` FROM `calculated_best_efforts` AS `calculatedBestEfforts` WHERE (`calculatedBestEfforts`.`activityId` = '14082150364');
INSERT INTO `calculated_best_efforts` (`start_date_local`,`distance`,`elapsed_time`,`moving_time`,`pr_rank`,`name`,`start_index`,`end_index`,`activityId`,`createdAt`,`updatedAt`) VALUES ('2025-04-04 18:35:58','91.44',30,30,NULL,'100 yards',3515,3545,14082150364,'2025-04-05 02:18:58','2025-04-05 02:18:58'),('2025-04-04 18:35:58','100',33,33,NULL,'100m',3511,3544,14082150364,'2025-04-05 02:18:58','2025-04-05 02:18:58'),('2025-04-04 18:35:58','400',141,141,NULL,'400m',3503,3644,14082150364,'2025-04-05 02:18:58','2025-04-05 02:18:58'),('2025-04-04 18:35:58','805',300,300,NULL,'1/2 mile',3367,3667,14082150364,'2025-04-05 02:18:58','2025-04-05 02:18:58'),('2025-04-04 18:35:58','1000',382,382,NULL,'1K',3284,3666,14082150364,'2025-04-05 02:18:58','2025-04-05 02:18:58'),('2025-04-04 18:35:58','1609',621,621,NULL,'1 mile',3048,3669,14082150364,'2025-04-05 02:18:58','2025-04-05 02:18:58'),('2025-04-04 18:35:58','3219',1305,1305,NULL,'2 mile',2366,3671,14082150364,'2025-04-05 02:18:58','2025-04-05 02:18:58'),('2025-04-04 18:35:58','5000',2088,2088,10,'5K',1579,3667,14082150364,'2025-04-05 02:18:58','2025-04-05 02:18:58') ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `route_coordinates_n` (`activityId`,`lat`,`lon`,`position_index`,`seconds_at_coords`,`compression_level`,`createdAt`,`updatedAt`) VALUES ('14082150364','40.768100','-73.980900',0,1,0.0001,'2025-04-05 02:51:21','2025-04-05 02:51:21'),('14082150364','40.768100','-73.980800',1,1,0.0001,'2025-04-05 02:51:21','2025-04-05 02:51:21');

INSERT INTO `related_activities_n` (`baseActivity`,`relatedActivity`,`longestCommonSegmentSubsequence`,`numberBaseSegments`,`numberRelatedSegments`,`routeScoreFromBase`,`routeScoreFromRelated`,`createdAt`,`updatedAt`) VALUES ('14082150364',13460526500,0,1030,1023,0,0,'2025-04-05 02:24:32','2025-04-05 02:24:32'),('14082150364',13443017892,0,1030,1025,0,0,'2025-04-05 02:24:32','2025-04-05 02:24:32'),('14082150364',13226710708,0,1030,1008,0,0,'2025-04-05 02:24:32','2025-04-05 02:24:32'),('14082150364',13211321380,0,1030,1008,0,0,'2025-04-05 02:24:32','2025-04-05 02:24:32'),('14082150364',12976255922,0,1030,976,0,0,'2025-04-05 02:24:32','2025-04-05 02:24:32'),('14082150364',12848782192,0,1030,1044,0,0,'2025-04-05 02:24:32','2025-04-05 02:24:32'),('14082150364',12534749003,0,1030,902,0,0,'2025-04-05 02:24:32','2025-04-05 02:24:32') ON DUPLICATE KEY UPDATE `longestCommonSegmentSubsequence`=VALUES(`longestCommonSegmentSubsequence`),`routeScoreFromBase`=VALUES(`routeScoreFromBase`),`routeScoreFromRelated`=VALUES(`routeScoreFromRelated`);
SELECT `relatedActivities`.`baseActivity`, `relatedActivities`.`relatedActivity`, `relatedActivities`.`segmentScoreFromBase`, `relatedActivities`.`segmentScoreFromRelated`, `relatedActivities`.`longestCommonSegmentSubsequence`, `relatedActivities`.`numberBaseSegments`, `relatedActivities`.`numberRelatedSegments`, `relatedActivities`.`routeScoreFromBase`, `relatedActivities`.`routeScoreFromRelated`, `relatedActivities`.`createdAt`, `relatedActivities`.`updatedAt`, `relatedActivityDetails`.`id` AS `relatedActivityDetails.id`, `relatedActivityDetails`.`name` AS `relatedActivityDetails.name`, `relatedActivityDetails`.`start_date` AS `relatedActivityDetails.start_date` FROM `related_activities_n` AS `relatedActivities` LEFT OUTER JOIN `activities` AS `relatedActivityDetails` ON `relatedActivities`.`relatedActivity` = `relatedActivityDetails`.`id` WHERE NOT (`relatedActivities`.`relatedActivity` = '14082150364') AND `routeScoreFromBase` + `routeScoreFromRelated` >= 1 AND `relatedActivities`.`baseActivity` = '14082150364' ORDER BY ``.`start_date` DESC;
*/



const fetchNewActivities = async ({ perPage = 100, page = 1 } = {}) => {
  const activitiesList = await fetchStrava(`/athlete/activities?per_page=${perPage}&page=${page}`);
  await bulkAddActivities(activitiesList); // couchdb
  const addedRecords = await bulkAddActivitiesFromStrava(activitiesList); // mysql

  // ^^^^ this is where the actions stop in activities-service

  // now get the details of the activities
  const activitiesDetails = await Promise.allSettled(addedRecords.map((record) => fetchStrava(`/activities/${record.id}`)));

  // filter out the errors
  const errors = activitiesDetails.filter((activityDetail) => activityDetail.status === 'rejected');
  if (errors.length > 0) {
    console.error('Errors fetching activity details:', errors);
  }

  // filter out the successes
  const succeeded = activitiesDetails.filter((activityDetail) => activityDetail.status === 'fulfilled');

  // add the activity details to the database
  await Promise.allSettled(succeeded.map(({ value }) => addActivityDetail(value)));
  await Promise.allSettled(succeeded
    .map(({ value }) => addBestEffortsForActivity(value.id, value.best_efforts || []))
  );

  return addedRecords.map(({ id }) => id);
}

module.exports = { fetchNewActivities };
