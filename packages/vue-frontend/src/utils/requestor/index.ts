import timeoutFetch from './timeoutFetch';

type RequestorCallOptions = Parameters<typeof timeoutFetch>[1];

const requestor = {
  headers: {
    'Content-Type': 'application/json',
  },
  domain: 'http://localhost:3001',
  setHeaders: (headers = {}) => {
    Object.assign(requestor.headers, headers);
  },
  stream: (path: string) => {
    const eventSource = new EventSource(`${requestor.domain}${path}`);
    eventSource.addEventListener('close', (event) => {
      console.log(`EventSource (${path}) connection closed by server`);
      eventSource.close();
    });
    eventSource.onerror = (error) => {
      console.warn(`EventSource (${path}) error:`, error);
      
      // Check the readyState to determine if connection is closed
      if (eventSource.readyState === EventSource.CLOSED) {
        console.error(`EventSource (${path}) connection closed permanently`);
        eventSource.close();
      } else {
        console.log(`EventSource (${path}) attempting to reconnect...`);
      }
    };
    return eventSource;
  },
  post: (
    path: string,
    data: unknown = {},
    options: RequestorCallOptions = {}
  ) => timeoutFetch(`${requestor.domain}${path}`, {
    body: JSON.stringify(data),
    ...options,
    headers: {
      ...requestor.headers,
      ...options.headers
    },
    method: 'POST',
  }),
  put: (
    path: string,
    data: unknown = {},
    options: RequestorCallOptions = {}
  ) => timeoutFetch(`${requestor.domain}${path}`, {
    body: JSON.stringify(data),
    ...options,
    headers: {
      ...requestor.headers,
      ...options.headers
    },
    method: 'PUT',
  }),
  delete: (
    path: string,
    data: unknown = {},
    options: RequestorCallOptions = {}
  ) => timeoutFetch(`${requestor.domain}${path}`, {
    body: JSON.stringify(data),
    ...options,
    headers: {
      ...requestor.headers,
      ...options.headers
    },
    method: 'DELETE',
  }),
  get: (
    path: string,
    options: RequestorCallOptions = {}
  ) => timeoutFetch(`${requestor.domain}${path}`, {
    ...options,
    headers: {
      ...requestor.headers,
      ...options.headers
    },
    method: 'GET',
  }),
};

export default requestor;
