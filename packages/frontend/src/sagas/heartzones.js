import { call, put } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { takeEveryContext } from './effects';
import {
  setApiErrorAct,
  setApiLoadingAct,
  setApiSuccessAct,
} from '../reducers/apiStatus-actions';
import {
  ADD_HEART_ZONES,
  FETCH_HEART_ZONES,
  setHeartZonesAct,
} from '../reducers/heartzones-actions';

function* fetchHeartZonesSaga() {
  const key = this.triggeredBy;
  try {
    yield put(setApiLoadingAct(key));
    const res = yield call(requestor.get, '/heartzones');
    const zones = yield res.json();
    yield put(setHeartZonesAct(zones));
    yield put(setApiSuccessAct(key));
  } catch (err) {
    yield put(setApiErrorAct(key));
  }
}

function* addHeartZonesSaga({ payload }) {
  const key = this.triggeredBy;
  try {
    yield put(setApiLoadingAct(key));
    const res = yield call(requestor.post, '/heartzones', payload);
    const zones = yield res.json();
    yield put(setHeartZonesAct(zones));
    yield put(setApiSuccessAct(key));
  } catch (err) {
    yield put(setApiErrorAct(key));
  }
}

export function* heartzonesSaga() {
  yield takeEveryContext(ADD_HEART_ZONES, addHeartZonesSaga);
  yield takeEveryContext(FETCH_HEART_ZONES, fetchHeartZonesSaga);
}
