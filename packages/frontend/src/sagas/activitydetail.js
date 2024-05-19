import { call, put, takeEvery } from 'redux-saga/effects';
import requestor from '../utils/requestor';

function* updateActivity({ payload }) {
  try {
    const { id, ...rest } = payload;
    const res = yield call(requestor.put, `/activities/${id}`, rest);
    const updatedRes = yield res.json();
    console.log(updatedRes);

    yield put({ type: 'activitiesReducer/UPDATE_ACTIVITY', payload });
  } catch (e) {
    yield put({ type: 'USER_FETCH_FAILED', message: e.message });
  }
}

function* fetchSimilarWorkouts({ payload: id }) {
  try {
    const res = yield call(requestor.post, '/analysis/similar-workouts/by-route', { id });
    const { combo } = yield res.json();

    yield put({ type: 'activitiesReducer/SET_SIMILAR_WORKOUTS', payload: { id, combo } });
  } catch (e) {
    yield put({ type: 'activitydetails/FETCH_SIMILAR_WORKOUTS_FAILED', message: e.message });
  }
}

export function* activitydetailSaga() {
  yield takeEvery('activitydetails/UPDATE_ACTIVITY', updateActivity);
  yield takeEvery('activitydetails/FETCH_SIMILAR_WORKOUTS', fetchSimilarWorkouts);
}
