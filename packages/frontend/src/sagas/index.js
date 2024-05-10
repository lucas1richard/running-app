import { fork } from 'redux-saga/effects'
import { activitiesListSaga } from './activitieslist'

function* mySaga() {
  yield fork(activitiesListSaga)
}

export default mySaga;
