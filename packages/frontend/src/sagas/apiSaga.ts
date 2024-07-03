import { call, put } from 'redux-saga/effects';
import {
  setApiErrorAct,
  setApiLoadingAct,
  setApiSuccessAct,
} from '../reducers/apiStatus-actions';

const makeApiSaga = (cb) => function* apiSaga(action) {
  try {
    yield put(setApiLoadingAct(action.key));
    yield call(cb, action);
    yield put(setApiSuccessAct(action.key));
  } catch (err) {
    yield put(setApiErrorAct(action.key));
  }
}

export default makeApiSaga;
