import { produce } from 'immer';
import deepmerge from 'deepmerge';
import dayjs, { OpUnitType } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';

import { createDeepEqualSelector } from '../utils';
import { selectListPrerences } from './preferences';
import {
  SET_ACTIVITIES,
  SET_ACTIVITIES_SUMMARY,
  SET_ACTIVITY_DETAIL,
  UPDATE_ACTIVITY,
  SET_STREAM,
  SET_STREAMS,
  SET_SIMILAR_WORKOUTS,
  SET_WEATHER_DATA,
} from './activities-actions';
import { selectAllHeartZones } from './heartzones';

dayjs.extend(weekday);

const activitiesInitialState = {
  activities: {},
  activitiesOrder: [],
  details: {},
  summary: {},
  streams: {},
  similarWorkouts: {},
  loading: false,
  error: undefined,
};

const activitiesReducer = (state = activitiesInitialState, action = {}) => {
  switch (action.type) {
    case SET_ACTIVITIES: {
      const activitiesOrder = action.payload.map(({ id }) => id);
      return produce(state, (nextState) => {
        nextState.activities = Object.fromEntries(
          action.payload.map((activity) => [activity.id, {
            ...activity, zonesCaches: Object.fromEntries(
              activity.zonesCaches?.map?.((zoneCache) => [zoneCache.heartZoneId, zoneCache]) || []
            )
          }])
        );
        nextState.activitiesOrder = activitiesOrder;
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
          bestEfforts: [
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
          nextState.details[activity.id] = { ...detail, desciption: action.payload.desciption };
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
      });
    }

    case SET_WEATHER_DATA: {
      return produce(state, (nextState) => {
        nextState.activities[action.payload.activityId].weather = action.payload;
      });
    }

    default:
      return state;
  }
};

const getActivitiesState = (state) => state.activities;

export const selectActivities = createDeepEqualSelector(
  [getActivitiesState],
  (activities) => {
    const order = [...activities.activitiesOrder];

    order.sort((a, b) => {
      const sStart = new Date(activities.activities[b].start_date_local); 
      const sEnd = new Date(activities.activities[a].start_date_local);
      return sStart - sEnd;
    });

    return order.map((id) => activities.activities[id]);
  }
);

export const selectListActivities = createDeepEqualSelector(
  [getActivitiesState,
  selectListPrerences],
  (activities, { sortBy, sortOrder }) => {
    const order = [...activities.activitiesOrder];

    order.sort((a, b) => {
      const first = sortOrder === 'asc' ? a : b;
      const second = sortOrder === 'asc' ? b : a;

      if (sortBy === 'start_date') {
        const sStart = new Date(activities.activities[first].start_date_local); 
        const sEnd = new Date(activities.activities[second].start_date_local);
        return sStart - sEnd;
      }

      return (activities.activities[first][sortBy]) - (activities.activities[second][sortBy]);
    });

    return order.map((id) => activities.activities[id]);
  }
);

export const makeSelectActivitySummary = (id) => (state) => state.activities.summary[id];

export const selectActivity = createDeepEqualSelector(
  getActivitiesState,
  (state, id) => id,
  (activities, id) => activities.activities[id]
)

export const selectActivityDetails = createDeepEqualSelector(
  getActivitiesState,
  (state, id) => id,
  (activities, id) => activities.details[id]
);

export const selectActivityDetailsMulti = createDeepEqualSelector(
  getActivitiesState,
  (state, ids) => ids,
  (activities, ids) => ids?.map((id) => activities.details[id]) || []
);

export const selectStreamType = createDeepEqualSelector(
  getActivitiesState,
  (state, id) => id,
  (state, id, findType) => findType,
  (activities, id, findType) => activities?.streams?.[id]?.stream?.find?.(({ type }) => type === findType)
);

export const selectStreamTypeMulti = createDeepEqualSelector(
  getActivitiesState,
  (state, ids) => ids,
  (state, ids, findType) => findType,
  (activities, ids, findType) => ids.map(
    (id) => activities?.streams?.[id]?.stream?.find?.(({ type }) => type === findType)
  )
);

export const selectSimilarWorkouts = createDeepEqualSelector(
  getActivitiesState,
  (state, id) => id,
  (activities, id) => (activities.similarWorkouts[id] || []).map((id) => activities.activities[id])
);

export const selectZoneGroupedRuns = createDeepEqualSelector(
  selectListActivities,
  selectListPrerences,
  selectAllHeartZones,
  (activities, { isGroupByZonesSet }, allzones) => {
      if (!isGroupByZonesSet) {
        return [{ runs: activities, zones: {}, start: '' }];
      }
      const dict = new Map();
      activities.forEach((run) => {
        const currDate = new Date(run.start_date_local);
        const zones = allzones.find(({ start_date }) => new Date(start_date) < currDate) || {};
        const { start_date } = zones;
        if (!dict.has(start_date)) {
          dict.set(start_date, { start: start_date, runs: [], zones });
        }
        dict.get(start_date).runs.push(run);
      });
  
      const vals = Array.from(dict.values());
      vals.sort((a, b) => new Date(b.start) - new Date(a.start));
      
      return vals;
  }
);

export const selectTimeGroupedRuns = createDeepEqualSelector(
  [
    selectActivities,
    (state, timeGroup: OpUnitType = 'week') => timeGroup
  ],
  (activities, timeGroup = 'week') => {
    const nextSunday = dayjs().endOf(timeGroup).add(1, 'day').startOf('day');
    const boxes = [];
    let curr = nextSunday;
    let next = curr.subtract(1, timeGroup);
    let runs = [];
    let sum = 0;
    const numActivities = activities.length;

    for (let i = 0; i < numActivities; i++) {
      const run = activities[i];
      if (dayjs(run.start_date_local).isBefore(next)) {
        boxes.push({ start: next, sum, runs });
        runs = [];
        curr = next;
        sum = 0;
        next = curr.subtract(1, timeGroup);
      }
      runs.push(run);
      sum += run.distance_miles;
    }

    return boxes;
  }
);

export default activitiesReducer;
