const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } = require('../constants');
const { getItem, storeItem, upsertItem } = require('./setupdb-mysql');

const getAccessToken = async () => {
  const { access_token, expires } = await getItem(1) || {};

  if (new Date(expires) < new Date() / 1000) {
    const record = await refreshAccessToken();
    return record.access_token;
  }

  return access_token;
};

const refreshAccessToken = async () => {
  const { refresh_token } = await getItem(1) || {};
  const res = await fetch('https://www.strava.com/api/v3/oauth/token', {
    method: 'POST',
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });

  const body = await res.json();
  const record = await upsertItem(body, 1);

  return body;
};

module.exports = {
  getAccessToken,
  refreshAccessToken,
};