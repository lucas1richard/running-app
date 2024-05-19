import { call, put, takeEvery } from 'redux-saga/effects';

function* updateActivity({ payload }) {
  try {
    const { id, ...rest } = payload;
    const res = yield call(
      fetch,
      `http://localhost:3001/activities/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(rest),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const updatedRes = yield res.json();
    console.log(updatedRes);

    yield put({ type: 'activitiesReducer/UPDATE_ACTIVITY', payload });
  } catch (e) {
    yield put({ type: 'USER_FETCH_FAILED', message: e.message });
  }
}

export function* activitydetailSaga() {
  yield takeEvery('activitydetails/UPDATE_ACTIVITY', updateActivity);
}
