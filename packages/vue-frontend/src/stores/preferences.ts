import deepmerge from 'deepmerge';
import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';

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

const usePreferencesStore = defineStore('preferences', () => {
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

  function setListPreferences(payload: any) {
    state.list.defined = deepmerge(state.list.defined, payload);
  }

  function setActivityPreferences(activityId: number, payload: ActivityPreferences) {
    state.activities[activityId] = deepmerge(state.activities[activityId], payload)
  }

  function setGlobalPreferences(preferences: any) {
    preferences.global.defined = deepmerge(preferences.global.defined, preferences);
  }

  function setPreferencesFree(keyPath: PreferencesKeyPath, value: any) {
    let pointer = state;
    keyPath.forEach((key, index) => {
      if (index === keyPath.length - 1) {
        // @ts-expect-error
        pointer[key] = value;
      } else {
        // @ts-expect-error
        if (pointer[key] === undefined) pointer[key] = {};
        // @ts-expect-error
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
      // @ts-expect-error
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

    list: state.list,
    setListPreferences,

    global: state.global,
    setGlobalPreferences,

    setPreferencesFree,
    getPreferenceFree,
    getPreferredHRZoneId,
  }
});

export default usePreferencesStore;
