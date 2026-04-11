import { activitiesListSaga } from '@/sagas/activitieslist';
import { activitydetailSaga } from '@/sagas/activitydetail';
import eventStreamSagaListener from '@/sagas/eventStreamSaga';
import { heartzonesSaga } from '@/sagas/heartzones';
import { preferencesSaga } from '@/sagas/preferences';
import { prsSaga } from '@/sagas/prs';
import { weatherSaga } from '@/sagas/weather';
import { fork } from 'redux-saga/effects';

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
