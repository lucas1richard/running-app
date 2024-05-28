import { call, put, select, takeEvery } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { selectActivityPreferences, selectGlobalPrerences, selectListPrerences } from '../reducers/preferences';

function* fetchUserPreferences({ payload }) {
  try {
    const response = yield call(requestor.get, '/user/preferences');
    const data = yield response.json();
    if (data?.list) {
      yield put({ type: 'preferencesReducer/SET_LIST_PREFERENCES', payload: data.list });
    }
    if (data?.global) {
      yield put({ type: 'preferencesReducer/SET_GLOBAL_PREFERENCES', payload: data.global });
    }
    if (data?.activities) {
      yield put({ type: 'preferencesReducer/SET_ACTIVITY_DEFAULTS', payload: data.activities.default });
    }
  } catch (error) {
    yield put({ type: 'FETCH_WEATHER_FAILURE', error: error.message });
  }
}

function* fetchActivityPreferences({ payload }) {
  try {
    const response = yield call(requestor.get, `/activities/${payload.activityId}/preferences`);
    const data = yield response.json();
    yield put({
      type: 'preferencesReducer/SET_ACTIVITY_PREFERENCES',
      payload: { activityId: payload.activityId, preferences: data },
    });
  } catch (error) {
    yield put({ type: 'FETCH_WEATHER_FAILURE', error: error.message });
  }
}

function* setUserPreferences({ payload }) { // everything except the individual activity preferences
  try {
    const existingListPref = yield(select(selectListPrerences));
    const existingGlobalPref = yield(select(selectGlobalPrerences));
    const defaultActivityPref = yield(select((state) => selectActivityPreferences(state, 'default')));
    const preferences = {
      list: existingListPref,
      global: existingGlobalPref,
      activities: { default: defaultActivityPref },
    };

    yield call(requestor.post, '/user/preferences', preferences);
  } catch (error) {
    yield put({ type: 'FETCH_WEATHER_FAILURE', error: error.message });
  }
}

function* setActivityPreferences({ payload }) {
  try {
    const preferences = yield(select((state) => selectActivityPreferences(state, payload.activityId)));
    yield call(requestor.put, `/activities/${payload.activityId}/preferences`, preferences);
  } catch (error) {
    yield put({ type: 'FETCH_WEATHER_FAILURE', error: error.message });
  }
}

export function* preferencesSaga() {
  yield takeEvery('preferences/FETCH_USER_PREFERENCES', fetchUserPreferences);
  yield takeEvery('preferences/FETCH_ACTIVITY_PREFERENCES', fetchActivityPreferences);
  yield takeEvery('preferences/SET_ACTIVITY_PREFERENCES', setActivityPreferences);
  yield takeEvery('preferences/SET_USER_PREFERENCES', setUserPreferences);
}