const INTERVALS_ICU_API_KEY = process.env.INTERVALS_ICU_API_KEY;

const fetchIntervalsIcu = async <T = unknown>(apiPath: string, options = {}) => {
  let path = apiPath;
  const method = options.method ?? 'GET';
  const queryParams = options.queryParams ?? {};
  const headers = new Headers();
  if (options.method === 'POST') headers.set('Content-type', 'application/json');

  if (apiPath.startsWith('/')) {
    path = apiPath.slice(1);
  }

  const url = new URL(`https://intervals.icu/api/v1/${path}`);

  // Assign authentication headers
  const auth = btoa(`API_KEY:${INTERVALS_ICU_API_KEY}`);
  headers.set('Authorization', `Basic ${auth}`);

  // Assign queryParams
  Object.entries(queryParams).forEach(([q, v]) => {
    if (Array.isArray(v)) {
      v.forEach(vv => url.searchParams.append(q, vv));
    } else {
      url.searchParams.append(q, v);
    }
  });

  console.log(url, headers);

  const res = await fetch(url, {
    ...options,
    method,
    headers
  });

  return res.json() as T;
};

export default fetchIntervalsIcu;
