import { produce } from 'immer';
import { createDeepEqualSelector } from '../utils';
import deepmerge from 'deepmerge';

const initialState = {
  isModified: false,
  activities: {
    default: {
      chart0: {
        title: 'Heart Rate',
        dataset0: 'average_heartrate',
        dataset1: 'velocity_smooth',
        plotbands: {
          zones: 'horizontal',
        }
      },
      chart1: {
        title: 'Segments',
        dataset0: 'average_heartrate',
        dataset1: 'velocity_smooth',
        plotbands: {
          zones: 'horizontal',
        }
      },
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
    case 'preferencesReducer/SET_LIST_PREFERENCES':
      return produce(state, (draft) => {
        draft.isModified = true;
        draft.list.defined = Object.fromEntries(
          Object.entries({ ...state.list.defined, ...action.payload })
            .filter(([key, value]) => value !== undefined)
        );
      });

    case 'preferencesReducer/SET_ACTIVITY_DEFAULTS':
      return produce(state, (draft) => {
        draft.isModified = true;
        // change default to activityId when backend supports it
        draft.activities.default = Object.fromEntries(
          Object.entries({ ...state.activities.default, ...action.payload })
            .filter(([key, value]) => value !== undefined)
        );
      });

    case 'preferencesReducer/SET_ACTIVITY_PREFERENCES':
      return produce(state, (draft) => {
        draft.isModified = true;
        const { activityId, preferences } = action.payload;
        draft.activities[activityId] = deepmerge(state.activities.default, preferences);
      });

    case 'preferencesReducer/SET_GLOBAL_PREFERENCES': 
      return produce(state, (draft) => {
        draft.isModified = true;
        draft.global.defined = Object.fromEntries(
          Object.entries({ ...state.global.defined, ...action.payload })
            .filter(([key, value]) => value !== undefined)
        );
      });

  case 'preferencesReducer/SET_PREFERENCE_FREE': {
    const { keyPath, value } = action.payload;
    return produce(state, (draft) => {
      draft.isModified = true;
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

export const getPreferencesState = (state) => state.preferences;

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

export const selectPreferencesZonesId = createDeepEqualSelector(
  getPreferencesState,
  (state) => {
    const { default: defaultPreferences, defined } = state.global;
    return typeof defined.zonesId === 'number'
      ? defined.zonesId
      : defaultPreferences.zonesId;
  }
);

export const selectActivityPreferences = createDeepEqualSelector(
  getPreferencesState,
  (state, id) => id,
  (state, id) => {
    const { default: defaultPreferences, [id]: idPrefs } = state.activities;
    return { ...defaultPreferences, ...idPrefs };
  }
);

export const selectPreferenceFree = (state, keyPath) => {
  const copyPath = [...keyPath];
  const firstMainArea = copyPath.shift();
  const localArea = copyPath.shift();
  const combined = {
    ...state.preferences[firstMainArea].default,
    ...state.preferences[firstMainArea][localArea],
  };
  const lastKey = copyPath.pop();
  const lastObj = copyPath.reduce((acc, key) => acc[key] || {}, combined);
  if (lastKey) return lastObj[lastKey];
  return lastObj;
}
// export const selectPreferenceFree = (state, keyPath) => {
//   const copyPath = [...keyPath];
//   const lastKey = copyPath.pop();
//   return copyPath.reduce((acc, key) => acc[key] || {}, state.preferences)[lastKey];
// }

export default preferencesReducer;