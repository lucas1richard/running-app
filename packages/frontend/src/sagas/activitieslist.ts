import { call, put, takeEvery } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import {
  FETCH_ACTIVITIES,
  FETCH_ACTIVITIES_SUMMARY,
  FETCH_ACTIVITY_DETAIL,
  FETCH_ACTIVITY_STREAM_DATA,
  FETCH_ALL_STREAMS,
  FETCH_HEATMAP_DATA,
  SET_HEATMAP_DATA,
  setActivitiesStreamAct,
  setActivitiesSummaryAct,
  setActivityDetailAct,
  setHeatMapDataAct,
  setStreamAct,
  setStreamsAct,
} from '../reducers/activities-actions';
import makeApiSaga from './apiSaga';
import { makeEventStreamSaga } from './eventStreamSaga';

function* fetchActivitiesSaga({ forceFetch }) {
  const data = [];
  const queryParam = new URLSearchParams({
    ...forceFetch ? { force: String(true) } : {},
  });

  const eventStreamSaga = makeEventStreamSaga(
    `/activities/listStream${queryParam ? '?' + queryParam : ''}`, function* ({ type, data: res, ix }) {
      if (type === 'DATA') {
        if (ix === 0) yield put(setActivitiesStreamAct(res));
        else data.push(res);
      } else if (type === 'CLOSE') {
        yield put(setActivitiesStreamAct(data.flat()));
      }
  });

  yield call(eventStreamSaga);
}

function* fetchHeatMapSaga() {
  const data = [];
  
  const eventStream = makeEventStreamSaga('/routeCoordinates/heatmap', function* ({ type, data: res }) {
    if (type === 'DATA') {
      data.push(res);
    } else if (type === 'CLOSE') {
      yield put(setHeatMapDataAct(data.flat()));
    }
  });

  yield call(eventStream);
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
  const res = yield call(requestor.get, '/activities/streams/list');
  const allStreams = yield res.json();
  yield put(setStreamsAct(allStreams));
}

function* fetchStreamDataSaga({ payload: { id, types } }) {
  const typesQuery = new URLSearchParams({ keys: types });
  const res: Response = yield call(requestor.get, `/activities/${id}/streams?${typesQuery}`);
  const stream: Stream = yield res.json();
  yield put(setStreamAct(id, stream));
}

export function* activitiesListSaga() {
  yield takeEvery(FETCH_ACTIVITIES, makeApiSaga(fetchActivitiesSaga));
  yield takeEvery(FETCH_ACTIVITIES_SUMMARY, makeApiSaga(fetchAcivitySummarySaga));
  yield takeEvery(FETCH_ACTIVITY_DETAIL, makeApiSaga(fetchActivityDetailSaga));
  yield takeEvery(FETCH_ACTIVITY_STREAM_DATA, makeApiSaga(fetchStreamDataSaga));
  yield takeEvery(FETCH_ALL_STREAMS, makeApiSaga(fetchAllStreamsSaga));
  yield takeEvery(FETCH_HEATMAP_DATA, makeApiSaga(fetchHeatMapSaga));
}
