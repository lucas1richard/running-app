export const FETCH_SIMILAR_WORKOUTS = 'activitydetails/FETCH_SIMILAR_WORKOUTS';
export const triggerFetchSimilarWorkouts = (id) => ({ type: FETCH_SIMILAR_WORKOUTS, payload: id });

export const SET_SIMILAR_WORKOUTS = 'activitiesReducer/SET_SIMILAR_WORKOUTS';
export const setSimilarWorkoutsAct = (id, combo) => ({ type: SET_SIMILAR_WORKOUTS, payload: { id, combo } });

export const TRIGGER_UPDATE_ACTIVITY = 'activitydetails/UPDATE_ACTIVITY';
export const triggerUpdateActivity = (activity) => ({ type: TRIGGER_UPDATE_ACTIVITY, payload: activity });
