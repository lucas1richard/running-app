import type { ICU_API_Response } from './intervalsicu.types.ts';
import type { LatLng, StravaStreamSet } from '../types/strava.ts';
import type { PersistenceActivity } from '../persistence/activities/acitivities.types.ts';

/**
 * Mapping from Intervals.icu stream names to Strava stream names.
 */
const STREAM_NAME_MAP: Record<string, string> = {
  'distance': 'distance',
  'heartrate': 'heartrate',
  'cadence': 'cadence',
  'altitude': 'altitude',
  'average_speed': 'velocity_smooth',
  'watts': 'watts',
};

/**
 * Mapping from stream names to their Strava data types.
 */
const STREAM_TYPE_MAP: Record<string, 'int32' | 'float32'> = {
  'distance': 'float32',
  'heartrate': 'int32',
  'cadence': 'int32',
  'altitude': 'float32',
  'velocity_smooth': 'float32',
  'watts': 'float32',
  'time': 'int32',
};

export const formatIcuActivityToStrava = (icuActivity: ICU_API_Response.ICU_Activity): PersistenceActivity => {
  return {
    id: Number(icuActivity.id.replace(/i/g, '')),
    name: icuActivity.name,
    distance: icuActivity.distance,
    moving_time: icuActivity.moving_time,
    elapsed_time: icuActivity.elapsed_time,
    total_elevation_gain: icuActivity.total_elevation_gain,
    sport_type: icuActivity.type,
    start_date: icuActivity.start_date,
    start_date_local: icuActivity.start_date_local,
    start_latlng: [0, 0],
    end_latlng: [0, 0],
    timezone: icuActivity.timezone,
    trainer: icuActivity.trainer,
    commute: icuActivity.commute,
    average_speed: icuActivity.average_speed,
    max_speed: icuActivity.max_speed,
    has_heartrate: icuActivity.has_heartrate,
    average_heartrate: icuActivity.average_heartrate,
    max_heartrate: icuActivity.max_heartrate,
    external_id: icuActivity.id,
  };
};

/**
 * Formats Intervals.icu streams into a Strava StreamSet.
 */
export const formatICUStreamsToStrava =
  (icuStreams: ICU_API_Response.ICU_Streams): StravaStreamSet => {
    let result: StravaStreamSet = [];

    for (const stream of icuStreams) {
      const stravaType = STREAM_NAME_MAP[stream.type] || stream.type;

      // Map data and replace nulls with 0 to keep array length consistent
      const data = stream.data;
      const data2 = stream.data2;

      if (stravaType === 'latlng') {
        const latLngs: LatLng[] = [];
        for (let i = 0; i < data.length; i += 1) {
          if (i + 1 < data.length) {
            latLngs.push([data[i], data2[i]]);
          }
        }

        result.push({
          type: 'latlng',
          data: latLngs,
          series_type: 'float32',
          original_size: latLngs.length,
          resolution: '1s',
        });
      } else {
        result.push({
          type: stravaType || stream.type as any, // Cast because SimpleStreamTypes might be missing some
          data: data,
          series_type: STREAM_TYPE_MAP[stravaType] || 'float32',
          original_size: data.length,
          resolution: '1s',
        });
      }
    }

    // intervals.icu has trailing null values on the latlng stream. I don't care about keeping them,
    // and I want all the streams to have the same length of data.
    const latlngStream = result.find((a) => a.type === 'latlng')?.data;
    if (latlngStream && latlngStream.length > 0) {
      let ix = latlngStream.length - 1;
      while (latlngStream[ix][0] === null || latlngStream[ix][1] === null) {
        latlngStream.pop();
        ix -= 1;
      }

      result = result.map((d) => ({ ...d, data: d.data.slice(0, latlngStream.length) }));
    }

    return result;
  };
