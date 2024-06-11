import { call, put, select } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { selectActivityPreferences, selectGlobalPrerences, selectListPrerences } from '../reducers/preferences';
import { takeEveryContext } from './effects';
import { setApiErrorAct, setApiLoadingAct, setApiSuccessAct } from '../reducers/apiStatus-actions';
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

function* fetchUserPreferencesSaga({ payload }) {
  const key = this.triggeredBy;
  try {
    yield put(setApiLoadingAct(key));
    const response = yield call(requestor.get, '/user/preferences');
    const data = yield response.json();

    if (data?.list) yield put(setListPrefsAct(data.list));
    if (data?.global) yield put(setGlobalPrefsAct(data.global));
    if (data?.activities) yield put(setActivityPrefDefaultsAct(data.activities.default));

    yield put(setApiSuccessAct(key));
  } catch (error) {
    yield put(setApiErrorAct(key));
  }
}

function* fetchActivityPreferencesSaga({ payload }) {
  const key = `${this.triggeredBy}-${payload.activityId}`;
  try {
    yield put(setApiLoadingAct(key));
    const response = yield call(requestor.get, `/activities/${payload.activityId}/preferences`);
    const data = yield response.json();
    yield put(setActivityPrefsAct(payload.activityId, data));
    yield put(setApiSuccessAct(key));
  } catch (error) {
    yield put(setApiErrorAct(key));
  }
}

function* setUserPreferencesSaga({ payload }) { // everything except the individual activity preferences
  const key = this.triggeredBy;
  try {
    yield put(setApiLoadingAct(key));
    const existingListPref = yield(select(selectListPrerences));
    const existingGlobalPref = yield(select(selectGlobalPrerences));
    const defaultActivityPref = yield(select((state) => selectActivityPreferences(state, 'default')));
    const preferences = {
      list: existingListPref,
      global: existingGlobalPref,
      activities: { default: defaultActivityPref },
    };

    yield call(requestor.post, '/user/preferences', preferences);
    yield put(setApiSuccessAct(key));
  } catch (error) {
    yield put(setApiErrorAct(key));
  }
}

function* setActivityPreferencesSaga({ payload }) {
  const key = `${this.triggeredBy}-${payload.activityId}`;
  try {
    yield put(setApiLoadingAct(key));
    const preferences = yield(select((state) => selectActivityPreferences(state, payload.activityId)));
    yield call(requestor.put, `/activities/${payload.activityId}/preferences`, preferences);
    yield put(setApiSuccessAct(key));
  } catch (error) {
    yield put(setApiErrorAct(key));
  }
}

export function* preferencesSaga() {
  yield takeEveryContext(FETCH_USER_PREFS, fetchUserPreferencesSaga);
  yield takeEveryContext(FETCH_ACTIVITY_PREFS, fetchActivityPreferencesSaga);
  yield takeEveryContext(SET_ACTIVITY_PREFS, setActivityPreferencesSaga);
  yield takeEveryContext(SET_USER_PREFS, setUserPreferencesSaga);
}