const { getAccessToken } = require('../persistence/utils');

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
