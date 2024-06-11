// SAGA TRIGGERS
export const FETCH_HEART_ZONES = 'heartzones/FETCH_HEART_ZONES';
export const triggerFetchHeartZones = () => ({ type: FETCH_HEART_ZONES });

// REDUCER ACTIONS
export const ADD_HEART_ZONES = 'heartzonesReducer/ADD_HEART_ZONES';
export const addHeartZonesAct = (payload) => ({ type: ADD_HEART_ZONES, payload });

export const SET_HEART_ZONES = 'heartzonesReducer/SET_HEART_ZONES';
export const setHeartZonesAct = (zones) => ({ type: SET_HEART_ZONES, payload: zones });
