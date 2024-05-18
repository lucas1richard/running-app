import { produce } from 'immer';

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

export const selectConfigZonesId = (state) => state.config.zonesId;

export default configReducer;
