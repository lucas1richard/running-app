import { call, put, select } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { selectActivityPreferences, selectGlobalPrerences, selectListPrerences } from '../reducers/preferences';
import { takeEveryContext } from './effects';

function* fetchUserPreferences({ payload }) {
  try {
    yield put({ type: 'apiReducer/SET_LOADING', key: this.triggeredBy });
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
    yield put({ type: 'apiReducer/SET_SUCCESS', key: this.triggeredBy });
  } catch (error) {
    yield put({ type: 'apiReducer/SET_ERROR', key: this.triggeredBy });
  }
}

function* fetchActivityPreferences({ payload }) {
  const key = `${this.triggeredBy}-${payload.activityId}`;
  try {
    yield put({ type: 'apiReducer/SET_LOADING', key });
    const response = yield call(requestor.get, `/activities/${payload.activityId}/preferences`);
    const data = yield response.json();
    yield put({
      type: 'preferencesReducer/SET_ACTIVITY_PREFERENCES',
      payload: { activityId: payload.activityId, preferences: data },
    });
    yield put({ type: 'apiReducer/SET_SUCCESS', key });
  } catch (error) {
    yield put({ type: 'apiReducer/SET_ERROR', key });
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
  yield takeEveryContext('preferences/FETCH_USER_PREFERENCES', fetchUserPreferences);
  yield takeEveryContext('preferences/FETCH_ACTIVITY_PREFERENCES', fetchActivityPreferences);
  yield takeEveryContext('preferences/SET_ACTIVITY_PREFERENCES', setActivityPreferences);
  yield takeEveryContext('preferences/SET_USER_PREFERENCES', setUserPreferences);
}