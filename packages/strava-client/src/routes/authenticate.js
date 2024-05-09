const { Router } = require('express');
const passport = require('passport');
StravaStrategy = require('passport-strava-oauth2').Strategy;

const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } = require('../constants');
const PORT = require('../port');
const { getItem, updateItem, storeItem } = require('../database/setupdb-mysql');

const router = new Router();

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Strava profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  // console.log(user);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  // console.log(obj);
  done(null, obj);
});

passport.use(new StravaStrategy({
  clientID: STRAVA_CLIENT_ID,
  clientSecret: STRAVA_CLIENT_SECRET,
  callbackURL: `http://127.0.0.1:${PORT}/auth/exchange_token`,
  // authorizationURL: `https://www.strava.com/oauth/authorize?scope=activity:read_all`
  scope: 'activity:read_all'
  // authorizationURL: `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID},response_type=code&scope=read,activity:read_all`
},
function(accessToken, refreshToken, profile, done) {
  console.log(profile);
  // asynchronous verification, for effect...
  process.nextTick(function () {

    // To keep the example simple, the user's Strava profile is returned to
    // represent the logged-in user.  In a typical application, you would want
    // to associate the Strava account with a user record in your database,
    // and return that user instead.
    return done();
  });
}
));

router.get('/strava',
  passport.authenticate('strava'));

router.get('/strava/callback', 
  passport.authenticate('strava', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});

router.get('/exchange_token', async (req, res) => {
  const code = req.query?.code;
  const record = await getItem(1);

  console.log(record);

  const query = `client_id=${STRAVA_CLIENT_ID}&client_secret=${STRAVA_CLIENT_SECRET}&code=${code}&grant_type=authorization_code`;
  const tokenRes = await fetch(`https://www.strava.com/api/v3/oauth/token?${query}`, {
    method: 'POST',
  });

  const token = await tokenRes.json();
  if (record) {
    await updateItem(1, token)
  } else {
    await storeItem(token)
  }

  res.json(token);
});

module.exports = {
  authRouter: router,
};

/**
 * {
strava-service-1  |   token_type: 'Bearer',
strava-service-1  |   expires_at: 1715118691,
strava-service-1  |   expires_in: 21600,
strava-service-1  |   refresh_token: 'db3a27c1a6d5e2d47c0f3a144547ff3c007b4969',
strava-service-1  |   access_token: '5efe05ad474ab7c373d919bf7576801f8c031570',
strava-service-1  |   athlete: {
strava-service-1  |     id: 85720357,
strava-service-1  |     username: null,
strava-service-1  |     resource_state: 2,
strava-service-1  |     firstname: 'Richard',
strava-service-1  |     lastname: 'Lucas',
strava-service-1  |     bio: null,
strava-service-1  |     city: null,
strava-service-1  |     state: null,
strava-service-1  |     country: null,
strava-service-1  |     sex: 'M',
strava-service-1  |     premium: false,
strava-service-1  |     summit: false,
strava-service-1  |     created_at: '2021-05-20T17:41:43Z',
strava-service-1  |     updated_at: '2024-03-18T00:23:17Z',
strava-service-1  |     badge_type_id: 0,
strava-service-1  |     weight: 0,
strava-service-1  |     profile_medium: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/85720357/20542422/1/medium.jpg',
strava-service-1  |     profile: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/85720357/20542422/1/large.jpg',
strava-service-1  |     friend: null,
strava-service-1  |     follower: null
strava-service-1  |   }
strava-service-1  | }

 */