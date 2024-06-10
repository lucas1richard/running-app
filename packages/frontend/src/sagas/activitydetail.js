import { call, put } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { takeEveryContext } from './effects';

function* updateActivity({ payload }) {
  const key = this.triggeredBy;
  try {
    yield put({ type: `apiReducer/SET_LOADING-${key}`, key });

    const { id, ...rest } = payload;
    const res = yield call(requestor.put, `/activities/${id}`, rest);
    yield res.json();

    yield put({ type: 'activitiesReducer/UPDATE_ACTIVITY', payload });
    yield put({ type: `apiReducer/SET_LOADING-${key}`, key });
  } catch (e) {
    yield put({ type: `apiReducer/SET_FAILED-${key}`, key });
  }
}

function* fetchSimilarWorkouts({ payload: id }) {
  const key = this.triggeredBy;
  try {
    yield put({ type: `apiReducer/SET_LOADING-${key}`, key });

    const res = yield call(requestor.post, '/analysis/similar-workouts/by-route', { id });
    const { combo } = yield res.json();

    yield put({ type: 'activitiesReducer/SET_SIMILAR_WORKOUTS', payload: { id, combo } });
    yield put({ type: `apiReducer/SET_LOADING-${key}`, key });
  } catch (e) {
    yield put({ type: `apiReducer/SET_FAILED-${key}`, key });
  }
}

export function* activitydetailSaga() {
  yield takeEveryContext('activitydetails/UPDATE_ACTIVITY', updateActivity);
  yield takeEveryContext('activitydetails/FETCH_SIMILAR_WORKOUTS', fetchSimilarWorkouts);
}
