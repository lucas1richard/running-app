import { combineReducers, configureStore, Reducer } from '@reduxjs/toolkit';
import activitiesReducer from './activities';

const reducer = combineReducers({
  activities: activitiesReducer,
});

export default reducer;
