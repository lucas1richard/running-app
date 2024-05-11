import { call, put, takeLatest } from 'redux-saga/effects';

function* fetchHeartZones() {
  try {
    const res = yield call(fetch, 'http://localhost:3001/heartzones');
    const zones = yield res.json();

    yield put({ type: 'heartzonesReducer/SET_HEART_ZONES', payload: zones });
  } catch (e) {
    yield put({ type: 'USER_FETCH_FAILED', message: e.message });
  }
}

function* addHeartZones({ payload }) {
  try {
    const res = yield call(fetch, 'http://localhost:3001/heartzones', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
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
