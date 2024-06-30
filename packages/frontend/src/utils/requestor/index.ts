import timeoutFetch from './timeoutFetch';

type RequestorCallOptions = Parameters<typeof timeoutFetch>[1];

const requestor = {
  headers: {
    'Content-Type': 'application/json',
  },
  domain: process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : '',
  setHeaders: (headers = {}) => {
    Object.assign(requestor.headers, headers);
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
