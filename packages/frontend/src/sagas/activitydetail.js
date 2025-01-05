import { call, put } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { takeEveryContext } from './effects';
import {
  SET_STREAM_PIN,
  DELETE_STREAM_PIN,
  UPDATE_STREAM_PIN,
  setSimilarWorkoutsAct,
  setStreamPinsAct,
  updateActivityAct,
} from '../reducers/activities-actions';
import {
  FETCH_SIMILAR_START,
  FETCH_SIMILAR_WORKOUTS,
  TRIGGER_UPDATE_ACTIVITY,
  setSimilarStartAct,
} from '../reducers/activitydetail-actions';
import makeApiSaga from './apiSaga';

function* updateActivitySaga({ payload }) {
  const { id, ...rest } = payload;
  const res = yield call(requestor.put, `/activities/${id}`, rest);
  yield res.json();
  yield put(updateActivityAct(payload));
}

function* fetchSimilarWorkoutsSaga({ payload: id }) {
  const res = yield call(requestor.get, `/activities/${id}/quick-similar`);
  const sim = yield res.json();
  yield put(setSimilarWorkoutsAct(id, sim));
}

function* setStreamPinSaga({ payload }) {
  const { streamKey, index, label, description, activityId, latlng } = payload;
  const res = yield call(requestor.post, `/activities/${activityId}/streams/pin`, {
    streamKey,
    index,
    label,
    description,
    latlng,
  });
  const json = yield res.json();
  yield put(setStreamPinsAct(activityId, json));
}

function* deleteStreamPinSaga({ payload }) {
  const { id, activityId } = payload;
  const res = yield call(requestor.delete, `/activities/${activityId}/streams/pin`, {
    id,
    activityId,
  });
  const json = yield res.json();
  yield put(setStreamPinsAct(activityId, json));
}

function* updateStreamPinSaga({ payload }) {
  const { id, streamKey, index, label, description, activityId } = payload
  const res = yield call(requestor.put, `/activities/${activityId}/streams/pin`, {
    id,
    streamKey,
    index,
    label,
    description,
  });
  const json = yield res.json();
  yield put(setStreamPinsAct(activityId, json));
}

function* fetchSimilarStartSaga({ payload }) {
  const { activityId, radius } = payload;
  const res = yield call(requestor.get, `/activities/${activityId}/find-by-start?${new URLSearchParams({ radius })}`);
  const json = yield res.json();
  yield put(setSimilarStartAct(activityId, radius, json));
}

export function* activitydetailSaga() {
  yield takeEveryContext(SET_STREAM_PIN, makeApiSaga(setStreamPinSaga));
  yield takeEveryContext(DELETE_STREAM_PIN, makeApiSaga(deleteStreamPinSaga));
  yield takeEveryContext(UPDATE_STREAM_PIN, makeApiSaga(updateStreamPinSaga));
  yield takeEveryContext(TRIGGER_UPDATE_ACTIVITY, makeApiSaga(updateActivitySaga));
  yield takeEveryContext(FETCH_SIMILAR_WORKOUTS, makeApiSaga(fetchSimilarWorkoutsSaga));
  yield takeEveryContext(FETCH_SIMILAR_START, makeApiSaga(fetchSimilarStartSaga));
}
