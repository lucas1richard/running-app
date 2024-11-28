import { fork } from 'redux-saga/effects'
import { activitydetailSaga } from './activitydetail';
import { activitiesListSaga } from './activitieslist'
import { heartzonesSaga } from './heartzones';
import { weatherSaga } from './weather';
import { preferencesSaga } from './preferences';
import { prsSaga } from './prs';

function* mySaga() {
  yield fork(activitydetailSaga);
  yield fork(activitiesListSaga);
  yield fork(heartzonesSaga);
  yield fork(weatherSaga);
  yield fork(preferencesSaga);
  yield fork(prsSaga);
}

export default mySaga;
