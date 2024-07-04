import { call, put, takeEvery } from 'redux-saga/effects';
import requestor from '../utils/requestor';
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
import makeApiSaga from './apiSaga';

function* fetchActivitiesSaga({ forceFetch }) {
  const queryParam = new URLSearchParams({
    ...forceFetch ? { force: String(true) } : {},
  });
  const res = yield call(requestor.get, `/activities/list?${queryParam}`);
  const acts = yield res.json();
  const sortedActs = [...acts];
  sortedActs.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  yield put(setActivitiesAct(sortedActs));
}

function* fetchAcivitySummarySaga() {
  const res = yield call(requestor.get, '/activities/summary');
  const summary = yield res.json();
  yield put(setActivitiesSummaryAct(summary));
};

function* fetchActivityDetailSaga ({ payload }) {
  const res = yield call(requestor.get, `/activities/${payload}/detail`);
  const detail = yield res.json();
  yield put(setActivityDetailAct(detail));
}

function* fetchAllStreamsSaga() {
  const res = yield call(requestor.get, `/activities/streams/list`);
  const allStreams = yield res.json();
  yield put(setStreamsAct(allStreams));
}

function* fetchStreamDataSaga({ payload: { id, types } }) {
  const typesQuery = new URLSearchParams({ keys: types });
  const res = yield call(requestor.get, `/activities/${id}/streams?${typesQuery}`);
  const stream = yield res.json();
  yield put(setStreamAct(id, stream));
}

export function* activitiesListSaga() {
  yield takeEvery(FETCH_ACTIVITIES, makeApiSaga(fetchActivitiesSaga));
  yield takeEvery(FETCH_ACTIVITIES_SUMMARY, makeApiSaga(fetchAcivitySummarySaga));
  yield takeEvery(FETCH_ACTIVITY_DETAIL, makeApiSaga(fetchActivityDetailSaga));
  yield takeEvery(FETCH_ACTIVITY_STREAM_DATA, makeApiSaga(fetchStreamDataSaga));
  yield takeEvery(FETCH_ALL_STREAMS, makeApiSaga(fetchAllStreamsSaga));
}
