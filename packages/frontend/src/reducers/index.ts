import activitiesReducer from '@/reducers/activities';
import apiStatusReducer from '@/reducers/apiStatus';
import heartzonesReducer from '@/reducers/heartzones';
import multimapReducer from '@/reducers/multimap';
import preferencesReducer from '@/reducers/preferences';
import prsReducer from '@/reducers/prs';
import { combineReducers } from '@reduxjs/toolkit';

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
