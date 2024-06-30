// SAGA TRIGGERS
export const FETCH_USER_PREFS = 'preferences/FETCH_USER_PREFERENCES';
export const triggerFetchUserPrefs = () => ({ type: FETCH_USER_PREFS });

export const FETCH_ACTIVITY_PREFS = 'preferences/FETCH_ACTIVITY_PREFERENCES';
export const triggerFetchActivityPrefs = (activityId) => ({
  type: FETCH_ACTIVITY_PREFS,
  payload: { activityId },
  key: `${FETCH_ACTIVITY_PREFS}-${activityId}`,
});

export const SET_ACTIVITY_PREFS = 'preferences/SET_ACTIVITY_PREFERENCES';
export const triggerSetActivityPrefs = (activityId, preferences) => ({ type: SET_ACTIVITY_PREFS, payload: { activityId, preferences } });

export const SET_USER_PREFS = 'preferences/SET_USER_PREFERENCES';
export const triggerSetUserPrefs = (preferences) => ({ type: SET_USER_PREFS, payload: preferences });

//

// REDUCER ACTIONS
export const REDUCER_SET_LIST_PREFS = 'preferencesReducer/SET_LIST_PREFERENCES';
export const setListPrefsAct = (preferences) => ({ type: REDUCER_SET_LIST_PREFS, payload: preferences });

export const REDUCER_SET_ACTIVITY_PREFS_DEFAULTS = 'preferencesReducer/SET_ACTIVITY_DEFAULTS';
export const setActivityPrefDefaultsAct = (defaults) => ({ type: REDUCER_SET_ACTIVITY_PREFS_DEFAULTS, payload: defaults });

export const REDUCER_SET_ACTIVITY_PREFS = 'preferencesReducer/SET_ACTIVITY_PREFERENCES';
export const setActivityPrefsAct = (activityId, preferences) => ({ type: REDUCER_SET_ACTIVITY_PREFS, payload: { activityId, preferences } });

export const SET_GLOBAL_PREFS = 'preferencesReducer/SET_GLOBAL_PREFERENCES';
export const setGlobalPrefsAct = (preferences) => ({ type: SET_GLOBAL_PREFS, payload: preferences });

export const SET_PREFS_FREE = 'preferencesReducer/SET_PREFERENCE_FREE';
export const setPrefsFreeAct = (keyPath, value) => ({ type: SET_PREFS_FREE, payload: { keyPath, value } });
