import { produce } from 'immer';
import deepmerge from 'deepmerge';
import dayjs, { type Dayjs, type ManipulateType } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';

import { createDeepEqualSelector } from '../utils';
import { getPreferencesState, selectListPrerences, selectPreferencesZonesId, selectSportTypePreferences } from './preferences';
import {
  SET_ACTIVITIES,
  SET_ACTIVITIES_STREAM,
  SET_ACTIVITIES_SUMMARY,
  SET_ACTIVITY_DETAIL,
  UPDATE_ACTIVITY,
  SET_STREAM,
  SET_STREAMS,
  SET_SIMILAR_WORKOUTS,
  SET_WEATHER_DATA,
  SET_STREAM_PINS,
  SET_HEATMAP_DATA,
  SET_ACTIVITIES_DISPLAY_TYPES,
} from './activities-actions';
import { getApplicableHeartZone, getHeartZones, selectAllHeartZones } from './heartzones';
import { emptyArray, emptyObject } from '../constants';
import type { RootState } from '.';
import { makeGet2ndArg, makeGet3rdArg } from '../utils/selectorUtils';

dayjs.extend(weekday);

export type ActivitiesState = {
  /** Activity types to display or not */
  displayTypes: Record<string, boolean>;
  activities: Record<number, Activity>;
  activitiesOrder: number[];
  details: Record<number, ActivityDetails>;
  summary: any;
  streams: Record<number, { stream: (Stream | LatLngStream)[] }>;
  similarWorkouts: Record<number, number[]>;
  similarWorkoutsMeta: Record<number, TODO>;
  loading: boolean;
  error: any;
  heatMap: Record<string, Array<HeatMapData>>
};

const activitiesInitialState: ActivitiesState = {
  displayTypes: {},
  activities: {},
  activitiesOrder: [],
  details: {},
  summary: {},
  streams: {},
  similarWorkouts: {},
  similarWorkoutsMeta: {},
  loading: false,
  error: undefined,
  heatMap: {},
};

interface Action {
  type: string;
  payload?: any;
}

const activitiesReducer = (state = activitiesInitialState, action: Action = { type: '' }) => {
  switch (action.type) {
    case SET_ACTIVITIES_DISPLAY_TYPES: {
      return produce(state, (nextState) => {
        nextState.displayTypes = { ...state.displayTypes, ...action.payload };
      });
    }
    case SET_ACTIVITIES: {
      const activitiesOrder = action.payload.map(({ id }) => id);
      return produce(state, (nextState) => {
        nextState.activities = Object.fromEntries(
          action.payload.map((activity) => [activity.id, {
            ...activity, zonesCaches: Object.fromEntries(
              activity.zonesCaches?.map?.((zoneCache) => [zoneCache.heartZoneId, zoneCache]) || emptyArray
            )
          }])
        );
        action.payload.forEach((activity) => {
          nextState.displayTypes[activity.sport_type] = true;
        });
        nextState.activitiesOrder = activitiesOrder;
        nextState.loading = false;
        nextState.error = undefined;
      });
    }

    case SET_ACTIVITIES_STREAM: {
      const activitiesOrder = action.payload.map(({ id }) => id);
      return produce(state, (nextState) => {
        nextState.activities = Object.assign({}, state.activities, Object.fromEntries(
          action.payload.map((activity) => [activity.id, {
            ...activity, zonesCaches: Object.fromEntries(
              activity.zonesCaches?.map?.((zoneCache) => [zoneCache.heartZoneId, zoneCache]) || emptyArray
            )
          }])
        ));
        nextState.activitiesOrder = [...state.activitiesOrder, ...activitiesOrder];
        action.payload.forEach((activity) => {
          nextState.displayTypes[activity.sport_type] = true;
        });
        nextState.loading = false;
        nextState.error = undefined;
      });
    }

    case SET_ACTIVITIES_SUMMARY: {
      return produce(state, (nextState) => {
        nextState.summary = action.payload;
      });
    }

    case SET_ACTIVITY_DETAIL: {
      return produce(state, (nextState) => {
        nextState.details[action.payload.id] = action.payload;
        nextState.activities[action.payload.id] = {
          ...state.activities[action.payload.id],
          calculatedBestEfforts: [
            ...action.payload.best_efforts.filter(({ pr_rank }) => !!pr_rank)
          ],
        };
      });
    }

    case UPDATE_ACTIVITY: {
      return produce(state, (nextState) => {
        const activity = state.activities[action.payload.id];
        nextState.activities[activity.id] = { ...activity, ...action.payload };

        if (action.payload.description) {
          const detail = state.details[activity.id];
          nextState.details[activity.id] = { ...detail, description: action.payload.description };
        }
      });
    }

    case SET_STREAM: {
      return produce(state, (nextState) => {
        const { id, data } = action.payload;
        nextState.streams[id] = deepmerge(state.streams[id], data);
      });
    }

    case SET_STREAMS: {
      return produce(state, (nextState) => {
        nextState.streams = action.payload.data;
      });
    }

    case SET_SIMILAR_WORKOUTS: {
      return produce(state, (nextState) => {
        nextState.similarWorkouts[action.payload.id] = action.payload.combo.map(
          ({ relatedActivity }) => relatedActivity
        );
        nextState.similarWorkoutsMeta[action.payload.id] = Object.fromEntries(action.payload.combo.map(
          c => [c.relatedActivity, c]
        ));
      });
    }

    case SET_WEATHER_DATA: {
      return produce(state, (nextState) => {
        nextState.activities[action.payload.activityId].weather = action.payload;
      });
    }

    case SET_STREAM_PINS: {
      return produce(state, (nextState) => {
        const { activityId, pins } = action.payload;
        const activity = state.activities[activityId];
        nextState.activities[activityId] = { ...activity, stream_pins: pins };
      });
    }

    case SET_HEATMAP_DATA:
      return produce(state, (nextState) => {
        const key = [action.payload.timeframe, action.payload.referenceTime].filter(Boolean).join('|') || 'all';
        if (!nextState.heatMap[key]) {
          nextState.heatMap[key] = [];
        }
        nextState.heatMap[key] = nextState.heatMap[key].concat(action.payload.data);
      });

    default:
      return state;
  }
};

const getActivitiesState = (state: RootState) => state.activities;

export const selectActivities = createDeepEqualSelector(
  [getActivitiesState, selectSportTypePreferences],
  (activities, displayPrefs) => {
    const order = [...activities.activitiesOrder];

    order.sort((a, b) => {
      const sStart = new Date(activities.activities[b].start_date_local).getTime();
      const sEnd = new Date(activities.activities[a].start_date_local).getTime();
      return sStart - sEnd;
    });

    return order.map((id) => activities.activities[id]).filter(({ sport_type }) => displayPrefs[sport_type]);
  }
);

const getListActivities = (activities, { sortBy, sortOrder}, displayTypePrefs, fromIx: number, toIx: number) => {
  const order = [...activities.activitiesOrder].slice(fromIx, toIx);

    order.sort((a, b) => {
      const first = sortOrder === 'asc' ? a : b;
      const second = sortOrder === 'asc' ? b : a;

      if (sortBy === 'start_date') {
        const sStart = new Date(activities.activities[first].start_date_local).getTime();
        const sEnd = new Date(activities.activities[second].start_date_local).getTime();
        return sStart - sEnd;
      }

      return (activities.activities[first][sortBy]) - (activities.activities[second][sortBy]);
    });

    return order.map((id) => activities.activities[id]).filter(({ sport_type }) => displayTypePrefs[sport_type]);
};
export const selectListActivities = createDeepEqualSelector([
  getActivitiesState,
  selectListPrerences,
  selectSportTypePreferences,
  makeGet2ndArg<number>(),
  makeGet3rdArg<number>(),
], getListActivities);

const getActivity = (activities: ActivitiesState, id: number) => activities.activities[id];
export const selectActivity = createDeepEqualSelector([
  getActivitiesState,
  makeGet2ndArg<number>(),
], getActivity)

const getActivityDetails = (activities: ActivitiesState, id: number) => activities.details[id];
export const selectActivityDetails = createDeepEqualSelector([
  getActivitiesState,
  makeGet2ndArg<number>(),
], getActivityDetails);

const getActivityDetailsMulti = (activities: ActivitiesState, ids: number[]) => {
  return ids?.map((id) => activities.details[id])
};
export const selectActivityDetailsMulti = createDeepEqualSelector([
  getActivitiesState,
  makeGet2ndArg<number[]>()
], getActivityDetailsMulti);

interface SelectStreamTypeData<Multi = false> {
  (state: RootState, id: Multi extends true ? number[] : number, findType: 'time'): Multi extends true ? Stream['data'][] : Stream['data'];
  (state: RootState, id: Multi extends true ? number[] : number, findType: 'heartrate'): Multi extends true ? Stream['data'][] : Stream['data'];
  (state: RootState, id: Multi extends true ? number[] : number, findType: 'distance'): Multi extends true ? Stream['data'][] : Stream['data'];
  (state: RootState, id: Multi extends true ? number[] : number, findType: 'altitude'): Multi extends true ? Stream['data'][] : Stream['data'];
  (state: RootState, id: Multi extends true ? number[] : number, findType: 'velocity_smooth'): Multi extends true ? Stream['data'][] : Stream['data'];
  (state: RootState, id: Multi extends true ? number[] : number, findType: 'grade_smooth'): Multi extends true ? Stream['data'][] : Stream['data'];
  (state: RootState, id: Multi extends true ? number[] : number, findType: 'latlng'): Multi extends true ? LatLngStream['data'][] : LatLngStream['data'];
}

const getStreamType = (state: RootState, id: number, findType: SimpleStreamTypes) => getActivitiesState(state)
  .streams?.[id]?.stream?.find?.(({ type }) => type === findType);
const getStreamTypeData = (state: RootState, id: number, findType: SimpleStreamTypes) => {
  const stream = getStreamType(state, id, findType);
  return stream?.data || emptyArray;
};
export const selectStreamTypeData = createDeepEqualSelector(getStreamTypeData, (res) => res) as SelectStreamTypeData;

const getStreamTypeMulti = (state: RootState, ids: number[], findType: string) => {
  const activities = getActivitiesState(state);
  return ids?.map((id) => activities?.streams?.[id]?.stream?.find?.(({ type }) => type === findType)?.data);
}
export const selectStreamTypeMulti = createDeepEqualSelector(getStreamTypeMulti, (res) => res) as SelectStreamTypeData<true>;

const getSimilarWorkouts = (activitiesState: ActivitiesState, id: number) => {
  const similarsIds = activitiesState.similarWorkouts[id] || emptyArray;
  return similarsIds.map((id) => activitiesState.activities[id]);
};
export const selectSimilarWorkouts = createDeepEqualSelector([
  getActivitiesState,
  makeGet2ndArg<number>(),
], getSimilarWorkouts);

const getSimilarWorkoutsMeta = (activitiesState: ActivitiesState, id: number) => {
  return activitiesState.similarWorkoutsMeta[id] || emptyArray;
};
export const selectSimilarWorkoutsMeta = createDeepEqualSelector([
  getActivitiesState,
  makeGet2ndArg<number>(),
], getSimilarWorkoutsMeta);

const getZoneGroupedRuns = (activities: any[], {isGroupByZonesSet}, allzones, fromIx = undefined, toIx = undefined) => {
  if (!isGroupByZonesSet) {
    return [{ runs: activities, zones: {}, start: '' }];
  }
  const dict = new Map();
  activities.forEach((run) => {
    const currDate = new Date(run.start_date_local);
    const zones = allzones.find(({ start_date }) => new Date(start_date) < currDate) || emptyObject;
    const { start_date } = zones;
    if (!dict.has(start_date)) {
      dict.set(start_date, { start: start_date, runs: [], zones });
    }
    dict.get(start_date).runs.push(run);
  });

  const vals = Array.from(dict.values());
  vals.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

  return vals;
}
export const selectZoneGroupedRuns = createDeepEqualSelector([
  selectListActivities,
  selectListPrerences,
  selectAllHeartZones,
  makeGet2ndArg<number>(),
], getZoneGroupedRuns);

const getTimeGroup = (_: RootState, timeGroup: ManipulateType = 'week') => timeGroup;
const getTimeGroupedRuns = (preferenceZoneId, allheartzones, activities: Activity[], timeGroup: ManipulateType) => {
  const nextSunday = dayjs().endOf(timeGroup).add(1, 'day').startOf('day');
  const boxes: { start: Dayjs, sum: number, runs: Activity[], zones: HeartZoneCache }[] = [];
  let curr = nextSunday;
  let next = curr.subtract(1, timeGroup);
  let runs = [];
  let sum = 0;
  let zones = {
    heartZoneId: 0,
    seconds_z1: 0,
    seconds_z2: 0,
    seconds_z3: 0,
    seconds_z4: 0,
    seconds_z5: 0,
  };
  const numActivities = activities.length;

  for (let i = 0; i < numActivities; i++) {
    const run = activities[i];
    if (dayjs(run.start_date_local).isBefore(next)) {
      boxes.push({ start: next, sum, runs, zones });
      runs = [];
      curr = next;
      sum = 0;
      zones = {
        heartZoneId: 0,
        seconds_z1: 0,
        seconds_z2: 0,
        seconds_z3: 0,
        seconds_z4: 0,
        seconds_z5: 0,
      };
      next = curr.subtract(1, timeGroup);
    }
    runs.push(run);
    sum += run.distance_miles;

    const nativeZones = getApplicableHeartZone(allheartzones, run.start_date);
    const heartRateZones = getHeartZones(allheartzones, run.start_date, nativeZones, preferenceZoneId);
    Object.entries(run.zonesCaches[heartRateZones.id] || {}).forEach(([key, value]) => {
      if (!zones[key]) zones[key] = 0;
      zones[key] += value;
    })
  }

  return boxes;
};
export const selectTimeGroupedRuns = createDeepEqualSelector(
  selectPreferencesZonesId, selectAllHeartZones, selectActivities, getTimeGroup,
  getTimeGroupedRuns
);

export const selectActivitiesByDate = createDeepEqualSelector(
  selectActivities,
  (activities) => {
    return activities.reduce((acc, activity) => {
      const date = dayjs(activity.start_date_local).format('YYYY-MM-DD');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    }
    , {});
  });

export const selectActivitiesByMonth = createDeepEqualSelector(
  selectActivities,
  makeGet2ndArg<string | Dayjs>(),
  (activities, monthStartDate) => {
    const month = dayjs(monthStartDate);
    const firstDayOfMonth = month.startOf('month');
    const lastDayOfMonth = month.endOf('month');
    return activities.reduce((acc, pr) => {
      const prdate = dayjs(pr.start_date_local)
      if (prdate.isAfter(firstDayOfMonth) && prdate.isBefore(lastDayOfMonth)) {
        const dateKey = prdate.format('YYYY-MM-DD');
        acc[dateKey] = acc[dateKey] || [];
        acc[dateKey].push(pr);
      }
      return acc;
    }, {}) as Record<string, Activity[]>;
  });

export const selectActivitiesDisplayTypes = createDeepEqualSelector(
  getActivitiesState,
  getPreferencesState,
  (state, prefsState) => ({
    ...state.displayTypes,
    ...prefsState.global.defined.activityDisplayTypes,
  }),
);

export default activitiesReducer;
