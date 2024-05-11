import { produce } from 'immer';

const heartzonesInitialState = {
  record: [],
};

const heartzonesReducer = (state = heartzonesInitialState, action = {}) => {
  switch (action.type) {
    case 'heartzonesReducer/SET_HEART_ZONES': {
      return produce(state, (nextState) => {
        nextState.record = action.payload;
      });
    }
    
    default:
      return state;
  }
};

export const selectAllHeartZones = (state) => state.heartzones.record;

export const makeSelectApplicableHeartZone = (date) => (state) => {
  const allzones = selectAllHeartZones(state);
  const currDate = new Date(date);

  // heart rate zones should be ordered by `start_date` descending
  return allzones.find(({ start_date }) => new Date(start_date) < currDate) || {};
};

export default heartzonesReducer;
