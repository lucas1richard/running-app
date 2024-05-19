import timeoutFetch from './timeoutFetch';

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
  post: (path, data = {}, options = {}) => timeoutFetch(`${requestor.domain}${path}`, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
    headers: {
      ...requestor.headers,
      ...options.headers
    },
  }),
  put: (path, data = {}, options = {}) => timeoutFetch(`${requestor.domain}${path}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
    headers: {
      ...requestor.headers,
      ...options.headers
    },
  }),
  delete: (path, data = {}, options = {}) => timeoutFetch(`${requestor.domain}${path}`, {
    method: 'DELETE',
    body: JSON.stringify(data),
    ...options,
    headers: {
      ...requestor.headers,
      ...options.headers
    },
  }),
  get: (path, options = {}) => timeoutFetch(`${requestor.domain}${path}`, {
    method: 'GET',
    ...options,
    headers: {
      ...requestor.headers,
      ...options.headers
    },
  }),
};

export default requestor;
