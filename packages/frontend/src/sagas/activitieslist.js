import { call, put, takeLatest } from 'redux-saga/effects';

// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* fetchActivities(action) {
  try {
    const res = yield call(fetch, 'http://localhost:3001/activities/list');
    console.log(res)
    const acts = yield res.json();
    const sortedActs = [...acts];
    sortedActs.sort((a, b) => Date(b.start_date) - Date(a.start_date))

    yield put({ type: 'activitiesReducer/SET_ACTIVITIES', payload: sortedActs })
  } catch (e) {
    yield put({ type: 'USER_FETCH_FAILED', message: e.message })
  }
}

// export function* watchIncrementAsync() {
//   yield takeEvery('INCREMENT_ASYNC', incrementAsync)
// }
export function* activitiesListSaga() {
  yield takeLatest('activities/FETCH_ACTIVITIES', fetchActivities);
}
