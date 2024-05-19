import { fork } from 'redux-saga/effects'
import { activitydetailSaga } from './activitydetail';
import { activitiesListSaga } from './activitieslist'
import { heartzonesSaga } from './heartzones';

function* mySaga() {
  yield fork(activitydetailSaga);
  yield fork(activitiesListSaga);
  yield fork(heartzonesSaga);
}

export default mySaga;
