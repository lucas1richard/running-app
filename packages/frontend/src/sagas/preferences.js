import { call, put, select } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { selectActivityPreferences, selectGlobalPrerences, selectListPrerences } from '../reducers/preferences';
import { takeEveryContext } from './effects';
import {
  FETCH_ACTIVITY_PREFS,
  FETCH_USER_PREFS,
  SET_ACTIVITY_PREFS,
  SET_USER_PREFS,
  setActivityPrefDefaultsAct,
  setActivityPrefsAct,
  setGlobalPrefsAct,
  setListPrefsAct,
} from '../reducers/preferences-actions';
import makeApiSaga from './apiSaga';

function* fetchUserPreferencesSaga({ payload }) {
  const response = yield call(requestor.get, '/user/preferences');
  const data = yield response.json();

  if (data?.list) yield put(setListPrefsAct(data.list));
  if (data?.global) yield put(setGlobalPrefsAct(data.global));
  if (data?.activities) yield put(setActivityPrefDefaultsAct(data.activities.default));
}

function* fetchActivityPreferencesSaga({ payload, key }) {
  const response = yield call(requestor.get, `/activities/${payload.activityId}/preferences`);
  const data = yield response.json();
  yield put(setActivityPrefsAct(payload.activityId, data));
}

function* setUserPreferencesSaga({ payload }) { // everything except the individual activity preferences
  const existingListPref = yield(select(selectListPrerences));
  const existingGlobalPref = yield(select(selectGlobalPrerences));
  const defaultActivityPref = yield(select((state) => selectActivityPreferences(state, 'default')));
  const preferences = {
    list: existingListPref,
    global: existingGlobalPref,
    activities: { default: defaultActivityPref },
  };

  yield call(requestor.post, '/user/preferences', preferences);
}

function* setActivityPreferencesSaga({ payload }) {
  const preferences = yield(select((state) => selectActivityPreferences(state, payload.activityId)));
  yield call(requestor.put, `/activities/${payload.activityId}/preferences`, preferences);
}

export function* preferencesSaga() {
  yield takeEveryContext(FETCH_USER_PREFS, makeApiSaga(fetchUserPreferencesSaga));
  yield takeEveryContext(FETCH_ACTIVITY_PREFS, makeApiSaga(fetchActivityPreferencesSaga));
  yield takeEveryContext(SET_ACTIVITY_PREFS, makeApiSaga(setActivityPreferencesSaga));
  yield takeEveryContext(SET_USER_PREFS, makeApiSaga(setUserPreferencesSaga));
}
