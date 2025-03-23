import { call, take } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga'
import requestor from '../utils/requestor';

function sseStream(path: string) {
  const eventSource = new EventSource(`${requestor.domain}${path}`);
  return eventChannel((emit) => {
    eventSource.onmessage = (event) => {
      console.log('Received message:', event);
      const data = JSON.parse(event.data);
      emit(data);
    };
    eventSource.onopen = () => {
      console.log('EventSource connection opened');
    }
    eventSource.addEventListener('close', (event) => {
      console.log('EventSource connection closed by server');
      emit(END);
      eventSource.close();
    });
    // Different approach to error handling
    eventSource.onerror = (error) => {
      console.warn('EventSource error:', error);
      
      // Check the readyState to determine if connection is closed
      if (eventSource.readyState === EventSource.CLOSED) {
        console.error('EventSource connection closed permanently');
        emit(END);
        eventSource.close();
      } else {
        // It's likely attempting to reconnect automatically (readyState === EventSource.CONNECTING)
        console.log('EventSource attempting to reconnect...');
      }
    };
    // The subscriber must return an unsubscribe function
    return () => {
      eventSource.close();
    };
  })
}

type CB = (...args: any[]) => any;

const makeEventStreamSaga = (path: string, cb: CB) => function* eventStreamSaga() {
  const chan = yield call(sseStream, path);
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
