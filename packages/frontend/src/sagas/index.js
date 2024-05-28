import { fork } from 'redux-saga/effects'
import { activitydetailSaga } from './activitydetail';
import { activitiesListSaga } from './activitieslist'
import { heartzonesSaga } from './heartzones';
import { weatherSaga } from './weather';
import { preferencesSaga } from './preferences';

function* mySaga() {
  yield fork(activitydetailSaga);
  yield fork(activitiesListSaga);
  yield fork(heartzonesSaga);
  yield fork(weatherSaga);
  yield fork(preferencesSaga);
}

export default mySaga;
