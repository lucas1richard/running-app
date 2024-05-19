import { produce } from 'immer';
import { createSelector } from 'reselect';

const configInitialState = {
  zonesId: -1,
};

const configReducer = (state = configInitialState, action = {}) => {
  switch (action.type) {
    case 'configReducer/RESET_TO_INITIAL':
      return configInitialState;

    case 'configReducer/SET_ZONES_ID': 
      return produce(state, (nextState) => {
        nextState.zonesId = action.payload;
      });
    default:
      return state;
  }
};

const getConfigState = (state) => state.config;

export const selectConfigZonesId = createSelector(
  getConfigState,
  (config) => config.zonesId
);

export default configReducer;
