import { call, put, takeEvery } from 'redux-saga/effects';

function* fetchActivities({ forceFetch }) {
  try {
    const queryParam = new URLSearchParams({
      ...forceFetch ? { force: true } : {},
    });
    const res = yield call(fetch, `http://localhost:3001/activities/list?${queryParam}`);
    const acts = yield res.json();
    const sortedActs = [...acts];
    sortedActs.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

    yield put({ type: 'activitiesReducer/SET_ACTIVITIES', payload: sortedActs });
  } catch (e) {
    yield put({ type: 'USER_FETCH_FAILED', message: e.message });
  }
}

function* fetchActivitySummary() {
  try {
    const res = yield call(fetch, 'http://localhost:3001/activities/summary');
    const summary = yield res.json();

    yield put({ type: 'activitiesReducer/SET_ACTIVITIES_SUMMARY', payload: summary });
  } catch (e) {
    yield put({ type: 'USER_FETCH_FAILED', message: e.message });
  }
}

function* fetchActivityDetail({ payload }) {
  try {
    const res = yield call(fetch, `http://localhost:3001/activities/${payload}/detail`);
    const summary = yield res.json();

    yield put({ type: 'activitiesReducer/SET_ACTIVITY_DETAIL', payload: summary });
  } catch (e) {
    yield put({ type: 'USER_FETCH_FAILED', message: e.message });
  }
}

function* fetchAllStreams() {
  try {
    const res = yield call(fetch, `http://localhost:3001/activities/streams/list`);
    const summary = yield res.json();

    yield put({ type: 'activitiesReducer/SET_STREAMS', payload: { data: summary } });
  } catch (e) {
    yield put({ type: 'USER_FETCH_FAILED', message: e.message });
  }
}

function* fetchStreamData({ id }) {
  try {
    const res = yield call(fetch, `http://localhost:3001/activities/${id}/streams`);
    const summary = yield res.json();

    yield put({ type: 'activitiesReducer/SET_STREAM', payload: { data: summary, id } });
  } catch (e) {
    yield put({ type: 'USER_FETCH_FAILED', message: e.message });
  }
}

// export function* watchIncrementAsync() {
//   yield takeEvery('INCREMENT_ASYNC', incrementAsync)
// }
export function* activitiesListSaga() {
  yield takeEvery('activities/FETCH_ACTIVITIES', fetchActivities);
  yield takeEvery('activities/FETCH_ACTIVITIES_SUMMARY', fetchActivitySummary);
  yield takeEvery('activities/FETCH_ACTIVITY_DETAIL', fetchActivityDetail);
  yield takeEvery('activities/FETCH_STREAM_DATA', fetchStreamData);
  yield takeEvery('activities/FETCH_ALL_STREAMS', fetchAllStreams);
}
