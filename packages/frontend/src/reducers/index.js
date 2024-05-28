import { combineReducers } from '@reduxjs/toolkit';
import activitiesReducer from './activities';
import heartzonesReducer from './heartszones';
import preferencesReducer from './preferences';

const reducer = combineReducers({
  activities: activitiesReducer,
  heartzones: heartzonesReducer,
  preferences: preferencesReducer,
});

export default reducer;
