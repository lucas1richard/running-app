import { combineReducers } from '@reduxjs/toolkit';
import activitiesReducer from './activities';
import heartzonesReducer from './heartzones';
import preferencesReducer from './preferences';
import apiStatusReducer from './apiStatus';

const reducer = combineReducers({
  activities: activitiesReducer,
  apiStatus: apiStatusReducer,
  heartzones: heartzonesReducer,
  preferences: preferencesReducer,
});

export default reducer;
