import { combineReducers } from '@reduxjs/toolkit';
import activitiesReducer from './activities';
import heartzonesReducer from './heartszones';
import configReducer from './config';

const reducer = combineReducers({
  activities: activitiesReducer,
  heartzones: heartzonesReducer,
  config: configReducer,
});

export default reducer;
