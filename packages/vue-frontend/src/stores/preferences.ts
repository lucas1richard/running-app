import deepmerge from 'deepmerge';
import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { useApiCallback } from './apiStatus';
import requestor from '@/utils/requestor';

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
    default: Record<string, TODO>;
    defined: Record<string, TODO>;
  };
  global: {
    default: Record<string, TODO>;
    defined: Record<string, TODO>;
  };
};

const usePreferencesStore = defineStore('preferences', () => {
  const makeApiCallback = useApiCallback();
  const state = reactive<PreferencesState>({
    activities: {
      default: {
        shouldShowLaps: true,
        shouldShowSegments: true,
        shouldShowSimilar: true,
      },
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
  });

  function fetchUserPreferences() {
    const key = `userPreferences`;
    return makeApiCallback(key, async () => {
      const res = await requestor.get(`/user/preferences`);
      const data = await res.json();
      if (data?.list) setListPreferences(data.list);
      if (data?.global) setGlobalPreferences(data.global);
      if (data?.activities) setActivityPreferences('default', data.activities.default);
    });
  }

  /** Sends the preferences state for persistence on the backend */
  function setUserPreferences() { // everything except the individual activity preferences
    const existingListPref = state.list;
    const existingGlobalPref = state.global;
    const defaultActivityPref = state.activities.default;
    const preferences = {
      list: existingListPref,
      global: existingGlobalPref,
      activities: { default: defaultActivityPref },
    };

    return requestor.post('/user/preferences', preferences);
  }

  function sendActivityPreferences({ activityId }) {
    const activityPrefs = state.activities[activityId] || {};
    requestor.put(`/activities/${activityId}/preferences`, activityPrefs);
  }

  function setListPreferences(payload: TODO) {
    state.list.defined = deepmerge(state.list.defined, payload);
  }

  function setActivityPreferences(activityId: number | 'default', payload: ActivityPreferences) {
    state.activities[activityId] = deepmerge(state.activities[activityId], payload)
  }

  function setGlobalPreferences(preferences: TODO) {
    state.global.defined = deepmerge(preferences.global?.defined || {}, preferences);
  }

  function setPreferencesFree(keyPath: PreferencesKeyPath, value: TODO) {
    let pointer = state;
    keyPath.forEach((key, index) => {
      if (index === keyPath.length - 1) {
        pointer[key] = value;
      } else {
        if (pointer[key] === undefined) pointer[key] = {};
        pointer = pointer[key];
      }
    });
  }

  const getPreferenceFree = (keyPath: PreferencesKeyPath) => computed(() => {
    const copyPath = [...keyPath];
    const firstMainArea = copyPath.shift() as keyof PreferencesState;
    const localArea = copyPath.shift() as string;
    const combined = {
      ...state[firstMainArea].default,
      ...state[firstMainArea][localArea],
    };
    const lastKey = copyPath.pop();
    const lastObj = copyPath.reduce((acc, key) => acc[key] || {}, combined);
    if (lastKey) return lastObj[lastKey];
    return lastObj;
  });

  function getPreferredHRZoneId() {
    return state.global.defined.zonesId === 'number'
      ? state.global.defined.zonesId
      : state.global.default.zonesId
  }

  return {
    activities: state.activities,
    setActivityPreferences,
    sendActivityPreferences,

    list: state.list,
    setListPreferences,

    global: state.global,
    setGlobalPreferences,

    fetchUserPreferences,
    setUserPreferences,

    setPreferencesFree,
    getPreferenceFree,
    getPreferredHRZoneId,
  }
});

export default usePreferencesStore;
