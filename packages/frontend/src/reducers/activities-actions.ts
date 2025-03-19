import { hash } from 'ohash';
import { AsyncAction } from '../types';

// SAGA TRIGGERS
export const FETCH_ACTIVITIES = 'activities/FETCH_ACTIVITIES';
export const triggerFetchActivities = (forceFetch = false): AsyncAction => ({
  type: FETCH_ACTIVITIES,
  forceFetch,
  // key: FETCH_ACTIVITIES,
});

export const FETCH_ACTIVITIES_SUMMARY = 'activities/FETCH_ACTIVITIES_SUMMARY';
export const triggerFetchActivitiesSummary = (): AsyncAction => ({
  type: FETCH_ACTIVITIES_SUMMARY,
  key: FETCH_ACTIVITIES_SUMMARY,
});

export const FETCH_ACTIVITY_DETAIL = 'activities/FETCH_ACTIVITY_DETAIL';
export const triggerFetchActivityDetail = (id: number): AsyncAction => ({
  type: FETCH_ACTIVITY_DETAIL,
  payload: id,
  key: `${FETCH_ACTIVITY_DETAIL}-${id}`,
});

export const FETCH_STREAMS = 'activities/FETCH_STREAMS';
export const triggerFetchStreams = (): AsyncAction => ({
  type: FETCH_STREAMS,
  key: FETCH_STREAMS,
});

export const FETCH_ALL_STREAMS = 'activities/FETCH_ALL_STREAMS';

export const FETCH_ACTIVITY_STREAM_DATA = 'activities/FETCH_ACTIVITY_STREAM_DATA';
export const triggerFetchActivityStreamData = (id: number, types: string[]): AsyncAction => ({
  type: FETCH_ACTIVITY_STREAM_DATA,
  payload: { id, types },
  key: `${FETCH_ACTIVITY_STREAM_DATA}-${id}`,
});

export const FETCH_WEATHER = 'activities/FETCH_WEATHER';
export const triggerFetchWeather = (activityId: number, data): AsyncAction => ({
  type: FETCH_WEATHER,
  payload: { id: activityId, ...data },
  key: `${FETCH_WEATHER}-${activityId}`,
});


export const SET_STREAM_PIN = 'activities/SET_STREAM_PIN';
export const setStreamPin = (
  activityId: number,
  streamKey: SimpleStreamTypes | 'latlng',
  index: number,
  label?: string,
  description?: string,
  latlng?: LatLng,
): AsyncAction => {
  const payload = { activityId, streamKey, index, label, description, latlng };
  return { type: SET_STREAM_PIN, payload, key: `${SET_STREAM_PIN}-${hash(payload)}` };
};

export const DELETE_STREAM_PIN = 'activities/DELETE_STREAM_PIN';
export const deleteStreamPin = (id: number, activityId: number): AsyncAction => {
  const payload = { activityId, id };
  return { type: DELETE_STREAM_PIN, payload, key: `${DELETE_STREAM_PIN}-${hash(payload)}` };
};

export const UPDATE_STREAM_PIN = 'activities/UPDATE_STREAM_PIN';
export const updateStreamPin = (data: StreamPin): AsyncAction => {
  return { type: UPDATE_STREAM_PIN, payload: data, key: `${UPDATE_STREAM_PIN}-${hash(data)}` };
};

// REDUCER ACTIONS
export const SET_ACTIVITIES = 'activitiesReducer/SET_ACTIVITIES';
export const setActivitiesAct = (activities: Activity[]) => ({ type: SET_ACTIVITIES, payload: activities });

export const SET_ACTIVITIES_STREAM = 'activitiesReducer/SET_ACTIVITIES_STREAM';
export const setActivitiesStreamAct = (activities: Activity[]) => ({ type: SET_ACTIVITIES_STREAM, payload: activities });

export const SET_ACTIVITIES_SUMMARY = 'activitiesReducer/SET_ACTIVITIES_SUMMARY';
export const setActivitiesSummaryAct = (summary) => ({ type: SET_ACTIVITIES_SUMMARY, payload: summary });

export const SET_ACTIVITY_DETAIL = 'activitiesReducer/SET_ACTIVITY_DETAIL';
export const setActivityDetailAct = (activity: Activity) => ({ type: SET_ACTIVITY_DETAIL, payload: activity });

export const UPDATE_ACTIVITY = 'activitiesReducer/UPDATE_ACTIVITY';
export const updateActivityAct = (activity: Activity) => ({ type: UPDATE_ACTIVITY, payload: activity });

export const SET_STREAM = 'activitiesReducer/SET_STREAM';
export const setStreamAct = (id: number, data: Stream) => ({ type: SET_STREAM, payload: { id, data } });

export const SET_STREAMS = 'activitiesReducer/SET_STREAMS';
export const setStreamsAct = (data) => ({ type: SET_STREAMS, payload: { data } });

export const SET_SIMILAR_WORKOUTS = 'activitiesReducer/SET_SIMILAR_WORKOUTS';
export const setSimilarWorkoutsAct = (id, combo) => ({ type: SET_SIMILAR_WORKOUTS, payload: { id, combo } });

export const SET_WEATHER_DATA = 'activitiesReducer/SET_WEATHER_DATA';
export const setWeatherDataAct = (data: Weather) => ({ type: SET_WEATHER_DATA, payload: data });

export const SET_STREAM_PINS = 'activitiesReducer/SET_STREAM_PINS';
export const setStreamPinsAct = (activityId: number, pins: StreamPin[]) => ({ type: SET_STREAM_PINS, payload: { activityId, pins } });
