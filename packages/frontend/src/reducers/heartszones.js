import { produce } from 'immer';
import { createDeepEqualSelector } from '../utils';
import { selectPreferencesZonesId } from './preferences';

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

const getHeartZonesState = (state) => state.heartzones;

export const selectAllHeartZones = createDeepEqualSelector(
  getHeartZonesState,
  (heartzones) => heartzones.record
);

export const makeSelectApplicableHeartZone = createDeepEqualSelector(
  selectAllHeartZones,
  (state, date) => date,
  (allzones, date) => {
    const currDate = new Date(date);
    // heart rate zones should be ordered by `start_date` descending
    return allzones.find(({ start_date }) => new Date(start_date) < currDate) || {};
  }
);

// /**
//  * - If zones are configured to be relative to date, get the applicable zone.
//  * - If zones are set to a specific value, use that value.
//  * @param {string} date 
//  */
export const getHeartZones = (state, date) => {
  const configZonesId = selectPreferencesZonesId(state);
  const allZones = selectAllHeartZones(state);
  const nativeZones = makeSelectApplicableHeartZone(state, date);
  const zonesId = configZonesId === -1 ? nativeZones.id : configZonesId;
  const zones = allZones.find(({ id }) => id === zonesId) || nativeZones;

  return zones;
};

export const selectHeartZones = createDeepEqualSelector(
  (state) => state,
  (state, date) => date,
  getHeartZones
);

export default heartzonesReducer;
