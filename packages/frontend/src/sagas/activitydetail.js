import { call, put } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { takeEveryContext } from './effects';

function* updateActivity({ payload }) {
  try {
    yield put({ type: 'apiReducer/SET_LOADING', key: this.triggeredBy });

    const { id, ...rest } = payload;
    const res = yield call(requestor.put, `/activities/${id}`, rest);
    yield res.json();

    yield put({ type: 'activitiesReducer/UPDATE_ACTIVITY', payload });
    yield put({ type: 'apiReducer/SET_SUCCESS', key: this.triggeredBy });
  } catch (e) {
    yield put({ type: 'apiReducer/SET_FAILED', key: this.triggeredBy });
  }
}

function* fetchSimilarWorkouts({ payload: id }) {
  try {
    yield put({ type: 'apiReducer/SET_LOADING', key: this.triggeredBy });

    const res = yield call(requestor.post, '/analysis/similar-workouts/by-route', { id });
    const { combo } = yield res.json();

    yield put({ type: 'activitiesReducer/SET_SIMILAR_WORKOUTS', payload: { id, combo } });
    yield put({ type: 'apiReducer/SET_SUCCESS', key: this.triggeredBy });
  } catch (e) {
    yield put({ type: 'apiReducer/SET_FAILED', key: this.triggeredBy });
  }
}

export function* activitydetailSaga() {
  yield takeEveryContext('activitydetails/UPDATE_ACTIVITY', updateActivity);
  yield takeEveryContext('activitydetails/FETCH_SIMILAR_WORKOUTS', fetchSimilarWorkouts);
}
