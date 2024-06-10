import { call, put } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import requestorSaga from './requestorSaga';
import { takeEveryContext } from './effects';

function* fetchActivities({ forceFetch }) {
  const key = this.triggeredBy;
  try {
    yield put({ type: `apiReducer/SET_LOADING-${key}`, key });
    const queryParam = new URLSearchParams({
      ...forceFetch ? { force: true } : {},
    });
    const acts = yield call(
      [this, requestorSaga],
      { method: 'get', key: 'activities/FETCH_ACTIVITIES' },
      `/activities/list?${queryParam}`
    );

    const sortedActs = [...acts];
    sortedActs.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

    yield put({ type: 'activitiesReducer/SET_ACTIVITIES', payload: sortedActs });
    yield put({ type: `apiReducer/SET_SUCCESS-${key}`, key });
  } catch (e) {
    yield put({ type: `apiReducer/SET_ERROR-${key}`, key });
  }
}

function* fetchActivitySummary() {
  const key = this.triggeredBy;
  yield put({ type: `apiReducer/SET_LOADING-${key}`, key });
  try {
    const res = yield call(requestor.get, '/activities/summary');
    const summary = yield res.json();

    yield put({ type: 'activitiesReducer/SET_ACTIVITIES_SUMMARY', payload: summary });
    yield put({ type: `apiReducer/SET_SUCCESS-${key}`, key });
  } catch (e) {
    yield put({ type: `apiReducer/SET_ERROR-${key}`, key });
  }
}

function* fetchActivityDetail({ payload }) {
  const key = `${this.triggeredBy}-${payload}`;
  yield put({ type: `apiReducer/SET_LOADING-${key}`, key });
  try {
    yield put({ type: `apiReducer/SET_LOADING-${key}`, key })
    const res = yield call(requestor.get, `/activities/${payload}/detail`);
    const summary = yield res.json();
    yield put({ type: 'activitiesReducer/SET_ACTIVITY_DETAIL', payload: summary });
    yield put({ type: `apiReducer/SET_SUCCESS-${key}`, key });
  } catch (e) {
    yield put({ type: `apiReducer/SET_ERROR-${key}`, key })
  }
}

function* fetchAllStreams() {
  const key = this.triggeredBy;
  try {
    yield put({ type: `apiReducer/SET_LOADING-${key}`, key });
    const res = yield call(requestor.get, `/activities/streams/list`);
    const summary = yield res.json();

    yield put({ type: 'activitiesReducer/SET_STREAMS', payload: { data: summary } });
    yield put({ type: `apiReducer/SET_SUCCESS-${key}`, key });
    
  } catch (e) {
    yield put({ type: 'activities/FETCH_ALL_STREAMS_FAILED', message: e.message });
    yield put({ type: 'apiReducer/SET_FAILURE', key });
  }
}

function* fetchStreamData({ id, types }) {
  const key = `${this.triggeredBy}-${id}`;
  try {
    yield put({ type: `apiReducer/SET_LOADING-${key}`, key });
    const typesQuery = new URLSearchParams({ keys: types });
    const res = yield call(requestor.get, `/activities/${id}/streams?${typesQuery}`);
    const summary = yield res.json();

    yield put({ type: 'activitiesReducer/SET_STREAM', payload: { data: summary, id } });
    yield put({ type: `apiReducer/SET_SUCCESS-${key}`, key });
  } catch (e) {
    yield put({ type: 'activities/FETCH_STREAMS_FAILED', message: e.message });
    yield put({ type: 'apiReducer/SET_FAILURE', key });
  }
}

export function* activitiesListSaga() {
  yield takeEveryContext('activities/FETCH_ACTIVITIES', fetchActivities);
  yield takeEveryContext('activities/FETCH_ACTIVITIES_SUMMARY', fetchActivitySummary);
  yield takeEveryContext('activities/FETCH_ACTIVITY_DETAIL', fetchActivityDetail);
  yield takeEveryContext('activities/FETCH_STREAM_DATA', fetchStreamData);
  yield takeEveryContext('activities/FETCH_ALL_STREAMS', fetchAllStreams);
}
