import { fork } from 'redux-saga/effects'
import { activitiesListSaga } from './activitieslist'
import { heartzonesSaga } from './heartzones';

function* mySaga() {
  yield fork(activitiesListSaga);
  yield fork(heartzonesSaga);
}

export default mySaga;
