import { call, put } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import requestorSaga from './requestorSaga';
import { takeEveryContext } from './effects';

function* fetchActivities({ forceFetch }) {
  try {
    yield put({ type: 'apiReducer/SET_LOADING', key: this.triggeredBy });
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
    yield put({ type: 'apiReducer/SET_SUCCESS', key: this.triggeredBy });
  } catch (e) {
    yield put({ type: 'apiReducer/SET_ERROR', key: this.triggeredBy });
  }
}

function* fetchActivitySummary() {
  yield put({ type: 'apiReducer/SET_LOADING', key: this.triggeredBy });
  try {
    const res = yield call(requestor.get, '/activities/summary');
    const summary = yield res.json();

    yield put({ type: 'activitiesReducer/SET_ACTIVITIES_SUMMARY', payload: summary });
    yield put({ type: 'apiReducer/SET_SUCCESS', key: this.triggeredBy });
  } catch (e) {
    yield put({ type: 'apiReducer/SET_ERROR', key: this.triggeredBy });
  }
}

function* fetchActivityDetail({ payload }) {
  const key = `${this.triggeredBy}-${payload}`;
  yield put({ type: 'apiReducer/SET_LOADING', key });
  try {
    yield put({ type: 'apiReducer/SET_LOADING', key })
    const res = yield call(requestor.get, `/activities/${payload}/detail`);
    const summary = yield res.json();
    yield put({ type: 'activitiesReducer/SET_ACTIVITY_DETAIL', payload: summary });
    yield put({ type: 'apiReducer/SET_SUCCESS', key });
  } catch (e) {
    yield put({ type: 'apiReducer/SET_ERROR', key })
  }
}

function* fetchAllStreams() {
  try {
    yield put({ type: 'apiReducer/SET_LOADING', key: this.triggeredBy });
    const res = yield call(requestor.get, `/activities/streams/list`);
    const summary = yield res.json();

    yield put({ type: 'activitiesReducer/SET_STREAMS', payload: { data: summary } });
    yield put({ type: 'apiReducer/SET_SUCCESS', key: this.triggeredBy });
    
  } catch (e) {
    yield put({ type: 'activities/FETCH_ALL_STREAMS_FAILED', message: e.message });
  }
}

function* fetchStreamData({ id, types }) {
  try {
    yield put({ type: 'apiReducer/SET_LOADING', key: `${this.triggeredBy}-${id}` });
    const typesQuery = new URLSearchParams({ keys: types });
    const res = yield call(requestor.get, `/activities/${id}/streams?${typesQuery}`);
    const summary = yield res.json();

    yield put({ type: 'activitiesReducer/SET_STREAM', payload: { data: summary, id } });
    yield put({ type: 'apiReducer/SET_SUCCESS', key: `${this.triggeredBy}-${id}` });
  } catch (e) {
    yield put({ type: 'activities/FETCH_STREAMS_FAILED', message: e.message });
    yield put({ type: 'apiReducer/SET_FAILURE', key: `${this.triggeredBy}-${id}` });
  }
}

export function* activitiesListSaga() {
  yield takeEveryContext('activities/FETCH_ACTIVITIES', fetchActivities);
  yield takeEveryContext('activities/FETCH_ACTIVITIES_SUMMARY', fetchActivitySummary);
  yield takeEveryContext('activities/FETCH_ACTIVITY_DETAIL', fetchActivityDetail);
  yield takeEveryContext('activities/FETCH_STREAM_DATA', fetchStreamData);
  yield takeEveryContext('activities/FETCH_ALL_STREAMS', fetchAllStreams);
}
