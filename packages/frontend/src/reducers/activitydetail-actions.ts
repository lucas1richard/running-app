import { AsyncAction } from '../types';

export const FETCH_SIMILAR_WORKOUTS = 'activitydetails/FETCH_SIMILAR_WORKOUTS';
export const triggerFetchSimilarWorkouts = (id: number): AsyncAction => ({
  type: FETCH_SIMILAR_WORKOUTS,
  payload: id,
  key: `${FETCH_SIMILAR_WORKOUTS}-${id}`,
});

export const SET_SIMILAR_WORKOUTS = 'activitiesReducer/SET_SIMILAR_WORKOUTS';
export const setSimilarWorkoutsAct = (id: number, combo: TODO[]) => ({ type: SET_SIMILAR_WORKOUTS, payload: { id, combo } });

export const TRIGGER_UPDATE_ACTIVITY = 'activitydetails/UPDATE_ACTIVITY';
export const triggerUpdateActivity = (activity: Partial<Activity>) => ({ type: TRIGGER_UPDATE_ACTIVITY, payload: activity });
