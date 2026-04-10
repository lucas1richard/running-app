import { combineReducers } from '@reduxjs/toolkit';
import activitiesReducer from '@/reducers/activities';
import heartzonesReducer from '@/reducers/heartzones';
import preferencesReducer from '@/reducers/preferences';
import apiStatusReducer from '@/reducers/apiStatus';
import prsReducer from '@/reducers/prs';
import multimapReducer from '@/reducers/multimap';

const reducer = combineReducers({
  activities: activitiesReducer,
  apiStatus: apiStatusReducer,
  heartzones: heartzonesReducer,
  multimap: multimapReducer,
  preferences: preferencesReducer,
  prs: prsReducer,
});

export type RootState = ReturnType<typeof reducer>;

export default reducer;
