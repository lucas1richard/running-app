const { getItem, upsertItem } = require('./setupdb-mysql');

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

const getAccessToken = async () => {
  const { access_token, expires } = await getItem(1) || {};

  if (new Date(expires).getTime() < (new Date().getTime() / 1000)) {
    const record = await refreshAccessToken();
    return record.access_token;
  }

  return access_token;
};

const refreshAccessToken = async () => {
  const { refresh_token } = await getItem(1) || {};
  const query = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    client_secret: STRAVA_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token,
  });
  const res = await fetch(`https://www.strava.com/api/v3/oauth/token?${query}`, {
    method: 'POST',
  });

  const body = await res.json();

  await upsertItem(body, 1);

  return body;
};

const fetchStrava = async (apiPath, options = { method: 'GET' }) => {
  const accessToken = await getAccessToken();

  console.log('FETCHING STRAVA: ', apiPath);

  const res = await fetch(`https://www.strava.com/api/v3${apiPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.method === 'GET' ? {} : { 'Content-Type': 'application/json' },
      ...options.headers,
    },
  });
  const resjson = await res.json();

  return resjson;
};

module.exports = fetchStrava;
