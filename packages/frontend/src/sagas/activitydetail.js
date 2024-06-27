import { call, put } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { takeEveryContext } from './effects';
import {
  setApiErrorAct,
  setApiLoadingAct,
  setApiSuccessAct,
} from '../reducers/apiStatus-actions';
import { setSimilarWorkoutsAct, updateActivityAct } from '../reducers/activities-actions';
import {
  FETCH_SIMILAR_WORKOUTS,
  TRIGGER_UPDATE_ACTIVITY,
} from '../reducers/activitydetail-actions';

function* updateActivitySaga({ payload }) {
  const key = `${this.triggeredBy}-${payload.id}`;
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

    const queryParams = new URLSearchParams({ activityId: id });
    const res = yield call(requestor.get, `/routes/network?${queryParams}`);
    const sim = yield res.json();

    yield put(setSimilarWorkoutsAct(id, sim));
    yield put(setApiSuccessAct(key));
  } catch (e) {
    console.log(e);
    yield put(setApiErrorAct(key));
  }
}

export function* activitydetailSaga() {
  yield takeEveryContext(TRIGGER_UPDATE_ACTIVITY, updateActivitySaga);
  yield takeEveryContext(FETCH_SIMILAR_WORKOUTS, fetchSimilarWorkoutsSaga);
}
