import { call, put } from 'redux-saga/effects';
import requestor from '../utils/requestor';

function* requestorSaga({ method, key: idKey } = {}, ...rest) {
  console.log(this)
  const key = idKey || `${method}-${rest}`;
  try {
    yield put({ type: 'apiReducer/SET_LOADING', key });
    const res = yield call(requestor[method], ...rest);
    yield put({ type: 'apiReducer/SET_SUCCESS', key });
    const responseBody = yield res.json();
    return responseBody;
  } catch (error) {
    yield put({ type: 'apiReducer/SET_ERROR', key, error: error.message });
    throw error;
  }
}

export default requestorSaga;
