import { produce } from 'immer';
import { createDeepEqualSelector } from '../utils';

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
    case 'activitiesReducer/SET_ACTIVITIES': {
      const activitiesOrder = action.payload.map(({ id }) => id);
      return produce(state, (nextState) => {
        nextState.activities = Object.fromEntries(
          action.payload.map((activity) => [activity.id, {
            ...activity, zonesCaches: Object.fromEntries(
              activity.zonesCaches.map((zoneCache) => [zoneCache.heartZoneId, zoneCache])
            )
          }])
        );
        nextState.activitiesOrder = activitiesOrder;
        nextState.loading = false;
        nextState.error = undefined;
      });
    }

    case 'activitiesReducer/SET_ACTIVITIES_SUMMARY': {
      return produce(state, (nextState) => {
        nextState.summary = action.payload;
      });
    }

    case 'activitiesReducer/SET_ACTIVITY_DETAIL': {
      return produce(state, (nextState) => {
        nextState.details[action.payload.id] = action.payload;
      });
    }

    case 'activitiesReducer/UPDATE_ACTIVITY': {
      return produce(state, (nextState) => {
        const activity = state.activities[action.payload.id];
        nextState.activities[activity.id] = { ...activity, ...action.payload };

        if (action.payload.description) {
          const detail = state.details[activity.id];
          nextState.details[activity.id] = { ...detail, desciption: action.payload.desciption };
        }
      });
    }

    case 'activitiesReducer/SET_STREAM': {
      return produce(state, (nextState) => {
        nextState.streams[action.payload.id] = action.payload.data;
      });
    }

    case 'activitiesReducer/SET_STREAMS': {
      return produce(state, (nextState) => {
        nextState.streams = action.payload.data;
      });
    }

    case 'activitiesReducer/SET_SIMILAR_WORKOUTS': {
      return produce(state, (nextState) => {
        nextState.similarWorkouts[action.payload.id] = action.payload.combo.map(({ id }) => id);
      });
    }

    case 'activitiesReducer/SET_WEATHER_DATA': {
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
  getActivitiesState,
  (activities) => activities.activitiesOrder.map((id) => activities.activities[id])
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

export const selectStreamType = createDeepEqualSelector(
  getActivitiesState,
  (state, id) => id,
  (state, id, findType) => findType,
  (activities, id, findType) => activities?.streams?.[id]?.stream?.find?.(({ type }) => type === findType)
);

export const selectSimilarWorkouts = createDeepEqualSelector(
  getActivitiesState,
  (state, id) => id,
  (activities, id) => (activities.similarWorkouts[id] || []).map((id) => activities.activities[id])
);

export default activitiesReducer;
