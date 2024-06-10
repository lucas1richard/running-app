import { call, put } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { takeEveryContext } from './effects';

function* fetchWeather({ payload }) {
  const { id, ...rest } = payload;
  const key = `${this.triggeredBy}-${id}`;
  try {
    yield put({ type: `apiReducer/SET_LOADING-${key}`, key });
    const withoutUndefined = Object.fromEntries(
      Object.entries(rest).filter(([_, v]) => !!v || typeof v == 'number')
    );
    const response = yield call(requestor.put, `/activities/${id}/weather`, withoutUndefined);
    const data = yield response.json();
    yield put({ type: 'activitiesReducer/SET_WEATHER_DATA', payload: data });
    yield put({ type: `apiReducer/SET_SUCCESS-${key}`, key });
  } catch (error) {
    yield put({ type: `apiReducer/SET_LOADING-${key}`, key });
  }
}

export function* weatherSaga() {
  yield takeEveryContext('weather/FETCH_WEATHER', fetchWeather);
}