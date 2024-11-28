import { combineReducers } from '@reduxjs/toolkit';
import activitiesReducer from './activities';
import heartzonesReducer from './heartzones';
import preferencesReducer from './preferences';
import apiStatusReducer from './apiStatus';
import prsReducer from './prs';

const reducer = combineReducers({
  activities: activitiesReducer,
  apiStatus: apiStatusReducer,
  heartzones: heartzonesReducer,
  preferences: preferencesReducer,
  prs: prsReducer,
});

export default reducer;
