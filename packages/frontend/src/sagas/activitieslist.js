import { call, put, takeLatest } from 'redux-saga/effects';

function* fetchActivities() {
  try {
    const res = yield call(fetch, 'http://localhost:3001/activities/list');
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
  yield takeLatest('activities/FETCH_ACTIVITIES', fetchActivities);
  yield takeLatest('activities/FETCH_ACTIVITIES_SUMMARY', fetchActivitySummary);
  yield takeLatest('activities/FETCH_STREAM_DATA', fetchStreamData);
}
