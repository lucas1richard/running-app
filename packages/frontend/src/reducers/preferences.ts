import { produce } from 'immer';
import { createDeepEqualSelector } from '../utils';
import deepmerge from 'deepmerge';
import {
  REDUCER_SET_LIST_PREFS,
  REDUCER_SET_ACTIVITY_PREFS,
  SET_GLOBAL_PREFS,
  SET_PREFS_FREE,
} from './preferences-actions';
import type { RootState } from '.';
import { makeGet2ndArg } from '../utils/selectorUtils';

export type PreferencesKeyPath = [string, string, ...string[]];

export type ActivityPreferences = {
  shouldShowLaps?: boolean;
  shouldShowSegments?: boolean;
  shouldShowSimilar?: boolean;
};

type PreferencesState = {
  activities: {
    default: ActivityPreferences;
  } & Record<number, ActivityPreferences>;
  list: {
    default: Record<string, any>;
    defined: Record<string, any>;
  };
  global: {
    default: Record<string, any>;
    defined: Record<string, any>;
  };
};

const initialState: PreferencesState = {
  activities: {
    default: {
      shouldShowLaps: true,
      shouldShowSegments: true,
      shouldShowSimilar: true,
    },
    // other keys would be the activity id
  },
  list: {
    default: {
      sortOrder: 'desc',
      sortBy: 'start_date',
      isGroupByZonesSet: true,
      tileBackgroundIndicator: 'weather',
    },
    defined: {}, // maintain state shape
  },
  global: {
    default: {
      zonesId: -1,
    },
    defined: {}, // maintain state shape
  },
};

const preferencesReducer = (state = initialState, action) => {
  switch (action.type) {
    case REDUCER_SET_LIST_PREFS:
      return produce(state, (draft) => {
        draft.list.defined = Object.fromEntries(
          Object.entries({ ...state.list.defined, ...action.payload })
            .filter(([key, value]) => value !== undefined)
        );
      });

    case REDUCER_SET_ACTIVITY_PREFS:
      return produce(state, (draft) => {
        const { activityId, preferences } = action.payload;
        draft.activities[activityId] = deepmerge(state.activities.default, preferences);
      });

    case SET_GLOBAL_PREFS: 
      return produce(state, (draft) => {
        draft.global.defined = Object.fromEntries(
          Object.entries({ ...state.global.defined, ...action.payload })
            .filter(([key, value]) => value !== undefined)
        );
      });

  case SET_PREFS_FREE: {
    const { keyPath, value } = action.payload;
    return produce(state, (draft) => {
      let pointer = draft;
      keyPath.forEach((key, index) => {
        if (index === keyPath.length - 1) {
          pointer[key] = value;
        } else {
          if (pointer[key] === undefined) pointer[key] = {};
          pointer = pointer[key];
        }
      });
    });
  }

    default:
      return state;
  }
};

export const getPreferencesState = (state: RootState) => state.preferences;

export const selectListPrerences = createDeepEqualSelector(
  getPreferencesState,
  (state) => {
    const { default: defaultPreferences, defined } = state.list;
    return { ...defaultPreferences, ...defined };
  }
);

export const selectGlobalPrerences = createDeepEqualSelector(
  getPreferencesState,
  (state) => {
    const { default: defaultPreferences, defined } = state.global;
    return { ...defaultPreferences, ...defined };
  }
);

const getPreferencesZoneId = (preferences: PreferencesState) => {
  const { default: defaultPreferences, defined } = preferences.global;
  return typeof defined.zonesId === 'number'
    ? defined.zonesId
    : defaultPreferences.zonesId;
};
export const selectPreferencesZonesId = createDeepEqualSelector(
  getPreferencesState,
  getPreferencesZoneId
);

const getActivityPreferences = (preferencesState: PreferencesState, id: number) => {
  const { default: defaultPreferences, [id]: idPrefs } = preferencesState.activities;
  return { ...defaultPreferences, ...idPrefs };
};

export const selectActivityPreferences = createDeepEqualSelector([
  getActivityPreferences,
  makeGet2ndArg<number>(),
], getActivityPreferences);

export const getPreferenceFree = (preferencesState: PreferencesState, keyPath: PreferencesKeyPath) => {
  const copyPath = [...keyPath];
  const firstMainArea = copyPath.shift();
  const localArea = copyPath.shift();
  const combined = {
    ...preferencesState[firstMainArea].default,
    ...preferencesState[firstMainArea][localArea],
  };
  const lastKey = copyPath.pop();
  const lastObj = copyPath.reduce((acc, key) => acc[key] || {}, combined);
  if (lastKey) return lastObj[lastKey];
  return lastObj;
}

export const selectPreferenceFree = createDeepEqualSelector([
  getPreferencesState,
  makeGet2ndArg<PreferencesKeyPath>(),
], getPreferenceFree);

export default preferencesReducer;
