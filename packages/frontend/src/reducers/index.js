import { combineReducers } from '@reduxjs/toolkit';
import activitiesReducer from './activities';
import heartzonesReducer from './heartszones';

const reducer = combineReducers({
  activities: activitiesReducer,
  heartzones: heartzonesReducer,
});

export default reducer;
