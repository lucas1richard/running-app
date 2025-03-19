import { call, fork, put, take, takeEvery } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga'
import { setActivitiesStreamAct } from '../reducers/activities-actions';
import requestor from '../utils/requestor';

function countdown(path: string) {
  const eventSource = new EventSource(`${requestor.domain}${path}`);
  return eventChannel((emit) => {
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      emit(data);
    };
    eventSource.onopen = () => {
      console.log('EventSource connection opened');
    }
    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
      emit(END)
    };
    // The subscriber must return an unsubscribe function
    return () => {
      eventSource.close();
    }
    }
  )
}

type CB = (...args: any[]) => any;

const makeEventStreamSaga = (path: string, cb: CB) => function* eventStreamSaga() {
  const chan = yield call(countdown, path);
  try {
    while (true) {
      const data = yield take(chan);
      yield call(cb, data);
    }
  } finally {
    console.log('EventStream terminated');
  }
  return chan;
}

export default makeEventStreamSaga;
