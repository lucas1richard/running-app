const { Sequelize } = require('sequelize');
const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } = require('../constants');
const { getItem, upsertItem } = require('./setupdb-mysql');

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

const sequelizeCoordsDistance = (
  refCoords,
  dist = 0.0003, // 33.33 meters
  col = 'start_latlng'
) => Sequelize.where(
  Sequelize.fn( // Geometric distance between two points
    'ST_Distance',
    Sequelize.col(col),
    Sequelize.fn('Point', refCoords[0], refCoords[1])
  ),
  Sequelize.Op.lte,
  dist
);

module.exports = {
  sequelizeCoordsDistance,
  getAccessToken,
  refreshAccessToken,
};
