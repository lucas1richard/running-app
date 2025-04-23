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

const getDate = (_, date: string) => date;
export const getApplicableHeartZone = (allzones: any[], date: string) => {
  const currDate = new Date(date);
  // heart rate zones should be ordered by `start_date` descending
  return allzones.find(({ start_date }) => new Date(start_date) < currDate) || emptyObject;
};
export const selectApplicableHeartZone = createDeepEqualSelector(
  [selectAllHeartZones, getDate], getApplicableHeartZone
);

export const getHeartZones = (allZones, date: string, nativeZones, configZonesId) => {
  const zonesId = configZonesId === -1 ? nativeZones.id : configZonesId;
  return allZones.find(({ id }) => id === zonesId) || nativeZones;
};
/**
 * - If zones are configured to be relative to date, get the applicable zone.
 * - If zones are set to a specific value, use that value.
 * @param {string} date 
 */
export const selectHeartZones = createDeepEqualSelector(
  [
    selectAllHeartZones,
    getDate,
    (state, date) => selectApplicableHeartZone(state, date),
    selectPreferencesZonesId
  ],
  getHeartZones
);

export default heartzonesReducer;
