import { call, put, takeEvery } from 'redux-saga/effects';
import requestor from '../utils/requestor';

function* fetchActivities({ forceFetch }) {
  try {
    const queryParam = new URLSearchParams({
      ...forceFetch ? { force: true } : {},
    });
    const res = yield call(requestor.get, `/activities/list?${queryParam}`);
    const acts = yield res.json();
    const sortedActs = [...acts];
    sortedActs.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    console.log(sortedActs)

    yield put({ type: 'activitiesReducer/SET_ACTIVITIES', payload: sortedActs });
  } catch (e) {
    yield put({ type: 'activities/FETCH_ACTIVITIES_FAILED', message: e.message });
  }
}

function* fetchActivitySummary() {
  try {
    const res = yield call(requestor.get, '/activities/summary');
    const summary = yield res.json();

    yield put({ type: 'activitiesReducer/SET_ACTIVITIES_SUMMARY', payload: summary });
  } catch (e) {
    yield put({ type: 'activities/FETCH_ACTIVITIES_SUMMARY_FAILED', message: e.message });
  }
}

function* fetchActivityDetail({ payload }) {
  const key = `activities/FETCH_ACTIVITY_DETAIL-${payload}`;
  try {
    yield put({ type: 'apiReducer/SET_LOADING', key })
    const res = yield call(requestor.get, `/activities/${payload}/detail`);
    const summary = yield res.json();
    yield put({ type: 'activitiesReducer/SET_ACTIVITY_DETAIL', payload: summary });
    yield put({ type: 'apiReducer/SET_SUCCESS', key })
  } catch (e) {
    yield put({ type: 'apiReducer/SET_ERROR', key, error: e.message })
  }
}

function* fetchAllStreams() {
  try {
    const res = yield call(requestor.get, `/activities/streams/list`);
    const summary = yield res.json();

    yield put({ type: 'activitiesReducer/SET_STREAMS', payload: { data: summary } });
  } catch (e) {
    yield put({ type: 'activities/FETCH_ALL_STREAMS_FAILED', message: e.message });
  }
}

function* fetchStreamData({ id, types }) {
  try {
    const typesQuery = new URLSearchParams({ keys: types });
    const res = yield call(requestor.get, `/activities/${id}/streams?${typesQuery}`);
    const summary = yield res.json();

    yield put({ type: 'activitiesReducer/SET_STREAM', payload: { data: summary, id } });
  } catch (e) {
    yield put({ type: 'activities/FETCH_STREAMS_FAILED', message: e.message });
  }
}

export function* activitiesListSaga() {
  yield takeEvery('activities/FETCH_ACTIVITIES', fetchActivities);
  yield takeEvery('activities/FETCH_ACTIVITIES_SUMMARY', fetchActivitySummary);
  yield takeEvery('activities/FETCH_ACTIVITY_DETAIL', fetchActivityDetail);
  yield takeEvery('activities/FETCH_STREAM_DATA', fetchStreamData);
  yield takeEvery('activities/FETCH_ALL_STREAMS', fetchAllStreams);
}
