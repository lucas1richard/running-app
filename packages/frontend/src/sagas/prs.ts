import { call, put, takeEvery } from 'redux-saga/effects';
import makeApiSaga from './apiSaga';
import requestor from '../utils/requestor';
import {
  FETCH_PRS,
  FETCH_PRS_BY_DATE,
  setPrsAct,
  setPrsByDateAct,
} from '../reducers/prs-actions';

function* fetchPrsSaga() {
  const res = yield call(requestor.get, `/activities/prs`);
  const prs = yield res.json();
  yield put(setPrsAct(prs));
}

function* fetchPrsByDateSaga() {
  const res = yield call(requestor.get, '/activities/prs/by-date');
  const prs = yield res.json();
  yield put(setPrsByDateAct(prs));
}

export function* prsSaga() {
  yield takeEvery(FETCH_PRS, makeApiSaga(fetchPrsSaga));
  yield takeEvery(FETCH_PRS_BY_DATE, makeApiSaga(fetchPrsByDateSaga));
}
