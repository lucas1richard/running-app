import { call, put, takeEvery } from 'redux-saga/effects';
import requestor from '../utils/requestor';

function* fetchWeather({ payload }) {
  try {
    const { id, ...rest } = payload;
    const withoutUndefined = Object.fromEntries(
      Object.entries(rest).filter(([_, v]) => !!v || typeof v == 'number')
    );
    const response = yield call(requestor.put, `/activities/${id}/weather`, withoutUndefined);
    const data = yield response.json();
    yield put({ type: 'activitiesReducer/SET_WEATHER_DATA', payload: data });
  } catch (error) {
    yield put({ type: 'FETCH_WEATHER_FAILURE', error: error.message });
  }
}

export function* weatherSaga() {
  yield takeEvery('weather/FETCH_WEATHER', fetchWeather);
}