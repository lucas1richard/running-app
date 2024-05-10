import { produce } from 'immer';

const activitiesInitialState = {
  activities: {},
  activitiesOrder: [],
  summary: {},
  streams: {},
  loading: false,
  error: undefined,
};

const activitiesReducer = (state = activitiesInitialState, action = {}) => {
  switch (action.type) {
    case 'activitiesReducer/SET_ACTIVITIES': {
      const activitiesOrder = action.payload.map(({ id }) => id);
      return produce(state, (nextState) => {
        nextState.activities = Object.fromEntries(action.payload.map((activity) => [activity.id, activity]));
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

    case 'activitiesReducer/SET_STREAM': {
      return produce(state, (nextState) => {
        nextState.streams[action.payload.id] = action.payload.data;
      });
    }
    
    default:
      return state;
  }
};

export const selectActivities = (state) => state
  .activities.activitiesOrder.map((id) => state.activities.activities[id]);

export const makeSelectActivitySummary = (id) => (state) => state.activities.summary[id];
export const makeSelectActivity = (id) => (state) => state.activities.activities[id];

export const makeSelectStreams = (id) => (state) => state.activities.streams[id];
export const makeSelectStreamType = (id, findType) => (state) => state.activities.streams[id]
  ?.stream.find(({ type }) => findType === type)
  || undefined;

export default activitiesReducer;
