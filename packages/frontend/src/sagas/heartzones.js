import { call, put } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { takeEveryContext } from './effects';

function* fetchHeartZones() {
  try {
    yield put({ type: 'apiReducer/SET_LOADING', key: this.triggeredBy });
    const res = yield call(requestor.get, '/heartzones');
    const zones = yield res.json();

    yield put({ type: 'heartzonesReducer/SET_HEART_ZONES', payload: zones });
    yield put({ type: 'apiReducer/SET_SUCCESS', key: this.triggeredBy });
  } catch (e) {
    yield put({ type: 'apiReducer/SET_ERROR', key: this.triggeredBy });
  }
}

function* addHeartZones({ payload }) {
  try {
    yield put({ type: 'apiReducer/SET_LOADING', key: this.triggeredBy });
    const res = yield call(requestor.post, '/heartzones', payload);
    const zones = yield res.json();

    yield put({ type: 'heartzonesReducer/SET_HEART_ZONES', payload: zones });
    yield put({ type: 'apiReducer/SET_SUCCESS', key: this.triggeredBy });
  } catch (e) {
    yield put({ type: 'apiReducer/SET_ERROR', key: this.triggeredBy });
  }
}

export function* heartzonesSaga() {
  yield takeEveryContext('heartzones/ADD_HEART_ZONES', addHeartZones);
  yield takeEveryContext('heartzones/FETCH_HEART_ZONES', fetchHeartZones);
}
