import { produce } from 'immer';
import { createDeepEqualSelector } from '../utils';
import { emptyObject } from '../constants';
import { selectPreferencesZonesId } from './preferences';
import { SET_HEART_ZONES } from './heartzones-actions';
import type { RootState } from '.';

const heartzonesInitialState = {
  record: [],
};

interface Action {
  type: string;
  payload?: any;
}

const heartzonesReducer = (state = heartzonesInitialState, action: Action = { type: '' }) => {
  switch (action.type) {
    case SET_HEART_ZONES: {
      return produce(state, (nextState) => {
        nextState.record = action.payload;
      });
    }

    default:
      return state;
  }
};

const getHeartZonesState = (state: RootState) => state.heartzones;

export const selectAllHeartZones = createDeepEqualSelector(
  getHeartZonesState,
  (heartzones) => heartzones.record
);

const getApplicableHeartZone = (state: RootState, date: string) => {
  const allzones = selectAllHeartZones(state);
  const currDate = new Date(date);
  // heart rate zones should be ordered by `start_date` descending
  return allzones.find(({ start_date }) => new Date(start_date) < currDate) || emptyObject;
};
export const selectApplicableHeartZone = createDeepEqualSelector(getApplicableHeartZone, (res) => res);

// /**
//  * - If zones are configured to be relative to date, get the applicable zone.
//  * - If zones are set to a specific value, use that value.
//  * @param {string} date 
//  */
const getHeartZones = (state: RootState, date: string) => {
  const configZonesId = selectPreferencesZonesId(state);
  const allZones = selectAllHeartZones(state);
  const nativeZones = getApplicableHeartZone(state, date);
  const zonesId = configZonesId === -1 ? nativeZones.id : configZonesId;
  const zones = allZones.find(({ id }) => id === zonesId) || nativeZones;

  return zones;
};
export const selectHeartZones = createDeepEqualSelector(getHeartZones, (res) => res);

export default heartzonesReducer;
