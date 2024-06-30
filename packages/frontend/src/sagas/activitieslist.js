import { call, put } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { takeEveryContext } from './effects';
import {
  FETCH_ACTIVITIES,
  FETCH_ACTIVITIES_SUMMARY,
  FETCH_ACTIVITY_DETAIL,
  FETCH_ACTIVITY_STREAM_DATA,
  FETCH_ALL_STREAMS,
  setActivitiesAct,
  setActivitiesSummaryAct,
  setActivityDetailAct,
  setStreamAct,
  setStreamsAct,
} from '../reducers/activities-actions';
import {
  setApiErrorAct,
  setApiLoadingAct,
  setApiSuccessAct,
} from '../reducers/apiStatus-actions';

function* fetchActivitiesSaga({ forceFetch, key }) {
  try {
    yield put(setApiLoadingAct(key));
    const queryParam = new URLSearchParams({
      ...forceFetch ? { force: true } : {},
    });
    const res = yield call(requestor.get, `/activities/list?${queryParam}`);
    const acts = yield res.json();
    const sortedActs = [...acts];
    sortedActs.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

    yield put(setActivitiesAct(sortedActs));
    yield put(setApiSuccessAct(key));
  } catch (e) {
    console.log(e)
    yield put(setApiErrorAct(key));
  }
}

function* fetchActivitySummarySaga({ key }) {
  yield put(setApiLoadingAct(key));
  try {
    const res = yield call(requestor.get, '/activities/summary');
    const summary = yield res.json();
    yield put(setActivitiesSummaryAct(summary));
    yield put(setApiSuccessAct(key));
  } catch (e) {
    yield put(setApiErrorAct(key));
  }
}

function* fetchActivityDetailSaga({ payload, key }) {
  try {
    yield put(setApiLoadingAct(key));
    const res = yield call(requestor.get, `/activities/${payload}/detail`);
    const detail = yield res.json();
    yield put(setActivityDetailAct(detail));
    yield put(setApiSuccessAct(key));
  } catch (e) {
    yield put(setApiErrorAct(key));
  }
}

function* fetchAllStreamsSaga({ key }) {
  try {
    yield put(setApiLoadingAct(key));
    const res = yield call(requestor.get, `/activities/streams/list`);
    const allStreams = yield res.json();
    yield put(setStreamsAct(allStreams));
    yield put(setApiSuccessAct(key));
  } catch (e) {
    yield put(setApiErrorAct(key));
  }
}

function* fetchStreamDataSaga({ payload: { id, types }, key }) {
  try {
    yield put(setApiLoadingAct(key));
    const typesQuery = new URLSearchParams({ keys: types });
    const res = yield call(requestor.get, `/activities/${id}/streams?${typesQuery}`);
    const stream = yield res.json();
    yield put(setStreamAct(id, stream));
    yield put(setApiSuccessAct(key))
  } catch (e) {
    yield put(setApiErrorAct(key));
  }
}

export function* activitiesListSaga() {
  yield takeEveryContext(FETCH_ACTIVITIES, fetchActivitiesSaga);
  yield takeEveryContext(FETCH_ACTIVITIES_SUMMARY, fetchActivitySummarySaga);
  yield takeEveryContext(FETCH_ACTIVITY_DETAIL, fetchActivityDetailSaga);
  yield takeEveryContext(FETCH_ACTIVITY_STREAM_DATA, fetchStreamDataSaga);
  yield takeEveryContext(FETCH_ALL_STREAMS, fetchAllStreamsSaga);
}
