import { call, put } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { takeEveryContext } from './effects';
import { setApiErrorAct, setApiLoadingAct, setApiSuccessAct } from '../reducers/apiStatus-actions';
import { FETCH_WEATHER, setWeatherDataAct } from '../reducers/activities-actions';

function* fetchWeatherSaga({ payload }) {
  const { id, ...rest } = payload;
  const key = `${this.triggeredBy}-${id}`;
  try {
    yield put(setApiLoadingAct(key));
    const withoutUndefined = Object.fromEntries(
      Object.entries(rest).filter(([_, v]) => !!v || typeof v == 'number')
    );
    const response = yield call(requestor.put, `/activities/${id}/weather`, withoutUndefined);
    const data = yield response.json();
    yield put(setWeatherDataAct(data));
    yield put(setApiSuccessAct(key));
  } catch (error) {
    yield put(setApiErrorAct(key));
  }
}

export function* weatherSaga() {
  yield takeEveryContext(FETCH_WEATHER, fetchWeatherSaga);
}