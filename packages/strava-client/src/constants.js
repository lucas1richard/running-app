const STRAVA_CLIENT_ID = '126147';
const STRAVA_CLIENT_SECRET = 'aff65b51fb277f00e16054b8d708fe6bf17138c2';
const STRAVA_ACCESS_TOKEN = 'de605b75515d83197e116db95be4cbd98e3e3908'; // changes daily

/** This is the code to pass to the API on every request */
const athleteAuthorizationCode = '5efe05ad474ab7c373d919bf7576801f8c031570'; // changes every 6 hrs

module.exports = {
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET,
  STRAVA_ACCESS_TOKEN,
  athleteAuthorizationCode,
};