import { fork } from 'redux-saga/effects'
import { activitydetailSaga } from '@/sagas/activitydetail';
import { activitiesListSaga } from '@/sagas/activitieslist'
import { heartzonesSaga } from '@/sagas/heartzones';
import { weatherSaga } from '@/sagas/weather';
import { preferencesSaga } from '@/sagas/preferences';
import { prsSaga } from '@/sagas/prs';
import eventStreamSagaListener from '@/sagas/eventStreamSaga';

function* mySaga() {
  yield fork(activitydetailSaga);
  yield fork(activitiesListSaga);
  yield fork(eventStreamSagaListener);
  yield fork(heartzonesSaga);
  yield fork(weatherSaga);
  yield fork(preferencesSaga);
  yield fork(prsSaga);
}

export default mySaga;
