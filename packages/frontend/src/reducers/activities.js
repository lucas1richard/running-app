const activitiesInitialState = {
  activities: {},
  activitiesOrder: [],
  loading: false,
  error: undefined,
};

const activitiesReducer = (state = activitiesInitialState, action) => {
  switch (action.type) {
    case 'activitiesReducer/SET_ACTIVITIES': {
      const activitiesOrder = action.payload.map(({ id }) => id);
      return {
        ...state,
        activities: Object.fromEntries(action.payload.map((activity) => [activity.id, activity])),
        activitiesOrder,
        loading: false,
        error: undefined,
      };
    }
    default: 
      return state;
    
  }
};

export const selectActivities = (state) => state.activities.activitiesOrder.map((id) => state.activities.activities[id]);

export default activitiesReducer;
