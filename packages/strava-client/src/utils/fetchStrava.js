const { getAccessToken } = require('../database/utils');

const fetchStrava = async (apiPath) => {
  const accessToken = await getAccessToken();
  const res = await fetch(`https://www.strava.com/api/v3${apiPath}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
  });
  const resjson = await res.json();

  return resjson;
};

module.exports = fetchStrava;
