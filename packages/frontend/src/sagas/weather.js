import { call, put } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { takeEveryContext } from './effects';
import { FETCH_WEATHER, setWeatherDataAct } from '../reducers/activities-actions';
import makeApiSaga from './apiSaga';

function* fetchWeatherSaga({ payload }) {
  const { id, ...rest } = payload;
  const withoutUndefined = Object.fromEntries(
    Object.entries(rest).filter(([_, v]) => !!v || typeof v == 'number')
  );
  const response = yield call(requestor.put, `/activities/${id}/weather`, withoutUndefined);
  const data = yield response.json();
  yield put(setWeatherDataAct(data));
}

export function* weatherSaga() {
  yield takeEveryContext(FETCH_WEATHER, makeApiSaga(fetchWeatherSaga));
}
