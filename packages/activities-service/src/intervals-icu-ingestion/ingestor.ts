import { activitiesDb, addActivity, addStream, bulkAddActivities } from '../persistence/setupdb-couchbase.ts';
import Activity from '../persistence/activities/model-activities.ts';
import { formatIcuActivityToStrava, formatICUStreamsToStrava } from './formatter.ts';
import type { ICU_API_Response } from './intervalsicu.types.ts';
import fetchIntervalsIcuStreams from './fetchIntervalsIcuStreams.ts';
import { calculateActivityBestEfforts } from '../controllers/calculateActivityBestEfforts.ts';
import { getMySQLConnection, query } from '../persistence/mysql-connection.ts';
import fetchIntervalsIcuActivities from './fetchInvervalsIcuActivities.ts';
import dayjs from 'dayjs';
import { insertActivitiesSql, insertBestEffortsSql } from '../persistence/sql-queries/index.ts';
import ingestActivityStreams from './ingestActivityStreams.ts';
// import BestEfforts from '../persistence/activities/model-best-efforts.ts';
// import type { PersistenceActivity } from '../persistence/activities/acitivities.types.ts';
// import { makeCompressedRoute } from '../controllers/makeCompressedRoute.ts';
// import { createHeartZonesCacheOnce, getAllHeartRateZones } from '../persistence/heartzones/index.ts';

/**
 * Process a raw activity from Intervals.icu:
 * 1. Save the raw response to CouchDB.
 * 2. Format the activity for Strava/MySQL.
 * 3. Save the formatted activity to MySQL.
 * 4. Fetch and normalize streams.
 * 5. Store normalized streams in CouchDB.
 * 6. Calculate compressed route.
 * 7. Calculate heart rate zones.
 * 8. Calculate best efforts and save to MySQL.
 */
export const processIcuActivity = async (rawActivity: ICU_API_Response.ICU_Activity) => {
  try {
    // 0. Duplicate Check
    // An activity is considered a duplicate if it has the same start date/time and sport type
    const existingActivity = await Activity.findOne({
      where: {
        start_date_local: rawActivity.start_date_local,
        sport_type: rawActivity.type,
      },
    });

    if (existingActivity) {
      console.log(`Activity already exists (duplicate found for ${rawActivity.id}): ${existingActivity.id}`);
      return {
        mysqlId: existingActivity.id,
        icuId: rawActivity.id,
        status: 'duplicate',
      };
    }

    // 1. Format the activity
    console.log('[processActivity]: 1. Format the activity');
    const formattedActivity = formatIcuActivityToStrava(rawActivity);

    console.log(formattedActivity);

    // 2. Save raw response to CouchDB
    console.log('[processActivity]: 2. Save raw response to CouchDB');
    try {
      await addActivity(formattedActivity, formattedActivity.id);
    } catch { }

    // 3. Save to MySQL
    const connection = await getMySQLConnection();
    console.log('[processActivity]: 3. Save to MySQL');
    const newActivities = [[
      formattedActivity.id,
      formattedActivity.name,
      formattedActivity.has_streams,
      formattedActivity.name,
      formattedActivity.distance,
      formattedActivity.moving_time,
      formattedActivity.elapsed_time,
      formattedActivity.total_elevation_gain,
      formattedActivity.type,
      formattedActivity.sport_type,
      new Date(formattedActivity.start_date),
      new Date(formattedActivity.start_date_local),
      formattedActivity.timezone,
      formattedActivity.utc_offset,
      formattedActivity.location_city,
      formattedActivity.location_state,
      formattedActivity.location_country,
      formattedActivity.achievement_count,
      formattedActivity.kudos_count,
      formattedActivity.comment_count,
      formattedActivity.athlete_count,
      formattedActivity.photo_count,
      formattedActivity.trainer,
      formattedActivity.commute,
      formattedActivity.manual,
      formattedActivity.private,
      formattedActivity.visibility,
      formattedActivity.flagged,
      formattedActivity.gear_id,
      { toSqlString: () => `Point(${connection.escape(formattedActivity.start_latlng[0] || 0)}, ${connection.escape(formattedActivity.start_latlng[1] || 0)})` },
      { toSqlString: () => `Point(${connection.escape(formattedActivity.end_latlng[0] || 0)}, ${connection.escape(formattedActivity.end_latlng[1] || 0)})` },
      formattedActivity.average_speed,
      formattedActivity.max_speed,
      formattedActivity.has_heartrate,
      formattedActivity.average_heartrate,
      formattedActivity.max_heartrate,
      formattedActivity.heartrate_opt_out,
      formattedActivity.display_hide_heartrate_option,
      formattedActivity.elev_high,
      formattedActivity.elev_low,
      formattedActivity.upload_id,
      formattedActivity.upload_id_str,
      formattedActivity.external_id,
      formattedActivity.from_accepted_tag,
      formattedActivity.pr_count,
      formattedActivity.total_photo_count,
      formattedActivity.has_kudoed,
      formattedActivity.map?.summary_polyline || null,
      { toSqlString: () => `NOW()` },
      { toSqlString: () => `NOW()` },
      formattedActivity.hidden ?? null,
    ]];
    // const activity = await Activity.create(formattedActivity) as unknown as PersistenceActivity;
    try {
      await query(insertActivitiesSql, [newActivities]);
    } catch { }
    const mysqlId = formattedActivity.id;

    // 4. Fetch and normalize streams
    console.log('[processActivity]: 4. Fetch and normalize streams');
    const icustream = await fetchIntervalsIcuStreams(rawActivity.id);

    const stream = formatICUStreamsToStrava(icustream);
    await ingestActivityStreams(stream, mysqlId);

    // const icuStreams = await fetchIntervalsIcuStreams(formattedActivity.external_id.toString());
    // const normalizedStreams = formatICUStreamsToStrava(icuStreams);

    // // 5. Store normalized streams in CouchDB
    // console.log('[processActivity]: 5. Store normalized streams in CouchDB');

    // // 6. Calculate compressed route
    // console.log('[processActivity]: 6. Calculate compressed route');
    // await makeCompressedRoute(mysqlId);

    // // 7. Calculate heart rate zones
    // console.log('[processActivity]: 7. Calculate heart rate zones');
    // const heartrateStream = normalizedStreams.find(s => s.type === 'heartrate')?.data;
    // if (heartrateStream) {
    //   const zones = await getAllHeartRateZones();
    //   if (zones && zones.length > 0) {
    //     const userZones = zones[0];
    //     const rangeMap = [userZones.z1, userZones.z2, userZones.z3, userZones.z4, userZones.z5, Number.POSITIVE_INFINITY];

    //     const zoneTimes = new Array(5).fill(0);
    //     heartrateStream.forEach(hr => {
    //       const zoneIdx = rangeMap.findIndex((thresh, ix) => thresh <= hr && rangeMap[ix + 1] > hr);
    //       if (zoneIdx >= 0 && zoneIdx < 5) {
    //         zoneTimes[zoneIdx]++;
    //       }
    //     });

    //     await createHeartZonesCacheOnce(mysqlId, userZones.id, zoneTimes);
    //   }
    // }

    // 8. Calculate and Save Best Efforts
    console.log('[processActivity]: 8. Calculate and Save Best Efforts');
    const efforts = await calculateActivityBestEfforts(mysqlId);
    if (Array.isArray(efforts) && efforts.length > 0) {
      const rankedEfforts = efforts.map((e) => ({
        start_date_local: formattedActivity.start_date_local,
        distance: e.distance,
        elapsed_time: e.time,
        moving_time: e.time,
        pr_rank: null,
        name: e.name,
        start_index: e.start,
        end_index: e.end,
        activityId: mysqlId,
      }));

      await query(insertBestEffortsSql, [
        rankedEfforts.map((effort) => [
          effort.start_date_local,
          effort.distance,
          effort.elapsed_time,
          effort.moving_time,
          effort.pr_rank,
          effort.name,
          effort.start_index,
          effort.end_index,
          effort.activityId,
          new Date(),
          new Date(),
        ])
      ]);
    }

    return {
      mysqlId,
      icuId: rawActivity.id,
    };
  } catch (error) {
    console.error(`Error processing ICU activity ${rawActivity.id}:`, error);
    throw error;
  }
};

export const processIcuActivitiesBatch = async (activities: ICU_API_Response.ICU_Activity[]) => {
  const results: { status: string, mysqlId?: number; icuId: string; error?: string; }[] = [];
  for (const activity of activities) {
    try {
      const res = await processIcuActivity(activity);
      results.push({ status: 'success', ...res });
    } catch (error) {
      results.push({ status: 'error', icuId: activity.id, error: (error as Error).message });
    }
  }
  return results;
};

export const ingestIntervalICUActivities = async (limit?: number) => {
  const latestActivity = await Activity.findOne({
    order: [['start_date_local', 'DESC']]
  });

  const dateSince = latestActivity.getDataValue('start_date_local');
  const icuActivities = await fetchIntervalsIcuActivities(dayjs(dateSince).format('YYYY-MM-DD'));
  icuActivities.reverse();
  const ids = await processIcuActivitiesBatch(icuActivities.slice(0, limit));

  console.log('[ingestIntervalICUActivities]: Done');

  return ids.map(({ mysqlId }) => mysqlId).filter(Boolean);
};