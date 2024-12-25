import { call, put } from 'redux-saga/effects';
import { hash } from 'ohash';
import {
  setApiErrorAct,
  setApiLoadingAct,
  setApiSuccessAct,
} from '../reducers/apiStatus-actions';
import type { AsyncAction } from '../types';

type CB =(...args: any[]) => any;

const makeApiSaga = (cb: CB) => function* apiSaga(action: AsyncAction) {
  const loadingKey = action.key || hash(action);
  try {
    yield put(setApiLoadingAct(loadingKey));
    yield call<CB>(cb, action);
    yield put(setApiSuccessAct(loadingKey));
  } catch (err) {
    yield put(setApiErrorAct(loadingKey));
  }
}

export default makeApiSaga;
