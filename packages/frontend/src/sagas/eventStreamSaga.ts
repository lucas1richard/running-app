import { call, put, take, takeEvery } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga'
import requestor from '../utils/requestor';
import makeApiSaga from './apiSaga';

function sseStream(path: string) {
  const eventSource = new EventSource(`${requestor.domain}${path}`);
  return eventChannel((emit) => {
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      emit(data);
    };
    eventSource.onopen = () => {
      console.log(`EventSource (${path}) connection opened`);
    }
    eventSource.addEventListener('close', (event) => {
      console.log(`EventSource (${path}) connection closed by server`);
      emit(END);
      eventSource.close();
    });
    // Different approach to error handling
    eventSource.onerror = (error) => {
      console.warn(`EventSource (${path}) error:`, error);
      
      // Check the readyState to determine if connection is closed
      if (eventSource.readyState === EventSource.CLOSED) {
        console.error(`EventSource (${path}) connection closed permanently`);
        emit(END);
        eventSource.close();
      } else {
        console.log(`EventSource (${path}) attempting to reconnect...`);
      }
    };
    // The subscriber must return an unsubscribe function
    return () => {
      eventSource.close();
    };
  })
}

type CB = (...args: any[]) => any;

export const makeEventStreamSaga = (path: string, cb: CB) => function* eventStreamSaga() {
  const chan = yield call(sseStream, path);
  let ix = 0;
  try {
    while (true) {
      const data = yield take(chan);
      yield call(cb, { type: 'DATA', data, ix: ix++ });
    }
  } catch (error) {
    console.error(`Error in eventStreamSaga for path ${path}:`, error);
  } finally {
    if (chan) {
      chan.close();
    }
    yield call(cb, { type: 'CLOSE' }); // Optionally notify the callback of closure
  }
}

export function* eventStreamSaga({ path, onData }) {
  const eventStreamSaga = makeEventStreamSaga(path, function* ({ type, data }) {
      if (type === 'DATA' && onData) {
        yield put({ type: onData, payload: data });
      }
    }
  );

  yield call(eventStreamSaga);
}

export default function* eventStreamSagaListener() {
  yield takeEvery('FETCH_EVENT_STREAM', makeApiSaga(eventStreamSaga));
}