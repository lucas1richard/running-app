import { produce } from 'immer';
import { selectConfigZonesId } from './config';

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

/**
 * - If zones are configured to be relative to date, get the applicable zone.
 * - If zones are set to a specific value, use that value.
 * @param {string} date 
 */
export const makeSelectZones = (date) => (state) => {
  const configZonesId = selectConfigZonesId(state);
  const allZones = selectAllHeartZones(state);
  const nativeZones = makeSelectApplicableHeartZone(date)(state);
  const zonesId = configZonesId === -1 ? nativeZones.id : configZonesId;
  const zones = allZones.find(({ id }) => id === zonesId) || nativeZones;

  return zones;
};

export default heartzonesReducer;
