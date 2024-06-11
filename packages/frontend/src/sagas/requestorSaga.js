import { call, put } from 'redux-saga/effects';
import requestor from '../utils/requestor';
import { setApiErrorAct, setApiLoadingAct, setApiSuccessAct } from '../reducers/apiStatus-actions';

function* requestorSaga(idKey, method, ...rest) {
  const key = idKey || `${method}-${rest}`;
  try {
    yield put(setApiLoadingAct(key));
    const res = yield call(requestor[method], ...rest);
    const responseBody = yield res.json();
    yield put(setApiSuccessAct(key));
    return responseBody;
  } catch (error) {
    yield put(setApiErrorAct(key));
    throw error;
  }
}

export default requestorSaga;
