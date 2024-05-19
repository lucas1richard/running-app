import { call, put, takeLatest } from 'redux-saga/effects';
import requestor from '../utils/requestor';

function* fetchHeartZones() {
  try {
    const res = yield call(requestor.get, '/heartzones');
    const zones = yield res.json();

    yield put({ type: 'heartzonesReducer/SET_HEART_ZONES', payload: zones });
  } catch (e) {
    yield put({ type: 'USER_FETCH_FAILED', message: e.message });
  }
}

function* addHeartZones({ payload }) {
  try {
    const res = yield call(requestor.post, '/heartzones', payload);
    const zones = yield res.json();

    yield put({ type: 'heartzonesReducer/SET_HEART_ZONES', payload: zones });
  } catch (e) {
    yield put({ type: 'USER_FETCH_FAILED', message: e.message });
  }
}

export function* heartzonesSaga() {
  yield takeLatest('heartzones/ADD_HEART_ZONES', addHeartZones);
  yield takeLatest('heartzones/FETCH_HEART_ZONES', fetchHeartZones);
}
