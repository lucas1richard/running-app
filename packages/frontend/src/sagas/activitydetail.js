import { call, put } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { takeEveryContext } from './effects';
import { setSimilarWorkoutsAct, updateActivityAct } from '../reducers/activities-actions';
import {
  FETCH_SIMILAR_WORKOUTS,
  TRIGGER_UPDATE_ACTIVITY,
} from '../reducers/activitydetail-actions';
import makeApiSaga from './apiSaga';

function* updateActivitySaga({ payload }) {
  const { id, ...rest } = payload;
  const res = yield call(requestor.put, `/activities/${id}`, rest);
  yield res.json();

  yield put(updateActivityAct(payload));
}

function* fetchSimilarWorkoutsSaga({ payload: id }) {
  const queryParams = new URLSearchParams({ activityId: id });
  const res = yield call(requestor.get, `/routes/network?${queryParams}`);
  const sim = yield res.json();

  yield put(setSimilarWorkoutsAct(id, sim));
}

export function* activitydetailSaga() {
  yield takeEveryContext(TRIGGER_UPDATE_ACTIVITY, makeApiSaga(updateActivitySaga));
  yield takeEveryContext(FETCH_SIMILAR_WORKOUTS, makeApiSaga(fetchSimilarWorkoutsSaga));
}
