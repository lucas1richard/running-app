// SAGA TRIGGERS
export const FETCH_ACTIVITIES = 'activities/FETCH_ACTIVITIES';
export const triggerFetchActivities = (forceFetch = false) => ({ type: FETCH_ACTIVITIES, forceFetch });

export const FETCH_ACTIVITIES_SUMMARY = 'activities/FETCH_ACTIVITIES_SUMMARY';
export const triggerFetchActivitiesSummary = () => ({ type: FETCH_ACTIVITIES_SUMMARY, });

export const FETCH_ACTIVITY_DETAIL = 'activities/FETCH_ACTIVITY_DETAIL';
export const triggerFetchActivityDetail = (id) => ({ type: FETCH_ACTIVITY_DETAIL, payload: id });

export const FETCH_STREAMS = 'activities/FETCH_STREAMS';
export const triggerFetchStreams = () => ({ type: FETCH_STREAMS, });

export const FETCH_ALL_STREAMS = 'activities/FETCH_ALL_STREAMS';

export const FETCH_ACTIVITY_STREAM_DATA = 'activities/FETCH_ACTIVITY_STREAM_DATA';
export const triggerFetchActivityStreamData = (id, types) => ({ type: FETCH_ACTIVITY_STREAM_DATA, payload: { id, types } });

export const FETCH_WEATHER = 'activities/FETCH_WEATHER';
export const triggerFetchWeather = (activityId, data) => ({ type: FETCH_WEATHER, payload: { id: activityId, ...data } });


// REDUCER ACTIONS
export const SET_ACTIVITIES = 'activitiesReducer/SET_ACTIVITIES';
export const setActivitiesAct = (activities) => ({ type: SET_ACTIVITIES, payload: activities });

export const SET_ACTIVITIES_SUMMARY = 'activitiesReducer/SET_ACTIVITIES_SUMMARY';
export const setActivitiesSummaryAct = (summary) => ({ type: SET_ACTIVITIES_SUMMARY, payload: summary });

export const SET_ACTIVITY_DETAIL = 'activitiesReducer/SET_ACTIVITY_DETAIL';
export const setActivityDetailAct = (activity) => ({ type: SET_ACTIVITY_DETAIL, payload: activity });

export const UPDATE_ACTIVITY = 'activitiesReducer/UPDATE_ACTIVITY';
export const updateActivityAct = (activity) => ({ type: UPDATE_ACTIVITY, payload: activity });

export const SET_STREAM = 'activitiesReducer/SET_STREAM';
export const setStreamAct = (id, data) => ({ type: SET_STREAM, payload: { id, data } });

export const SET_STREAMS = 'activitiesReducer/SET_STREAMS';
export const setStreamsAct = (data) => ({ type: SET_STREAMS, payload: { data } });

export const SET_SIMILAR_WORKOUTS = 'activitiesReducer/SET_SIMILAR_WORKOUTS';
export const setSimilarWorkoutsAct = (id, combo) => ({ type: SET_SIMILAR_WORKOUTS, payload: { id, combo } });

export const SET_WEATHER_DATA = 'activitiesReducer/SET_WEATHER_DATA';
export const setWeatherDataAct = (data) => ({ type: SET_WEATHER_DATA, payload: data });
