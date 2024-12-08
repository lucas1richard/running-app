import { combineReducers } from '@reduxjs/toolkit';
import activitiesReducer from './activities';
import heartzonesReducer from './heartzones';
import preferencesReducer from './preferences';
import apiStatusReducer from './apiStatus';
import prsReducer from './prs';
import multimapReducer from './multimap';

const reducer = combineReducers({
  activities: activitiesReducer,
  apiStatus: apiStatusReducer,
  heartzones: heartzonesReducer,
  multimap: multimapReducer,
  preferences: preferencesReducer,
  prs: prsReducer,
});

export default reducer;
