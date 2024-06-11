import { call, put } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { takeEveryContext } from './effects';
import { setApiErrorAct, setApiLoadingAct, setApiSuccessAct } from '../reducers/apiStatus-actions';
import { updateActivityAct } from '../reducers/activities-actions';

function* updateActivitySaga({ payload }) {
  const key = this.triggeredBy;
  try {
    yield put(setApiLoadingAct(key));

    const { id, ...rest } = payload;
    const res = yield call(requestor.put, `/activities/${id}`, rest);
    yield res.json();

    yield put(updateActivityAct(payload));
    yield put(setApiSuccessAct(key));
  } catch (e) {
    yield put(setApiErrorAct(key));
  }
}

function* fetchSimilarWorkoutsSaga({ payload: id }) {
  const key = this.triggeredBy;
  try {
    yield put(setApiLoadingAct(key));

    const res = yield call(requestor.post, '/analysis/similar-workouts/by-route', { id });
    const { combo } = yield res.json();

    yield put({ type: 'activitiesReducer/SET_SIMILAR_WORKOUTS', payload: { id, combo } });
    yield put(setApiSuccessAct(key));
  } catch (e) {
    yield put(setApiErrorAct(key));
  }
}

export function* activitydetailSaga() {
  yield takeEveryContext('activitydetails/UPDATE_ACTIVITY', updateActivitySaga);
  yield takeEveryContext('activitydetails/FETCH_SIMILAR_WORKOUTS', fetchSimilarWorkoutsSaga);
}
