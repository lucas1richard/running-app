const { Router } = require('express');
const passport = require('passport');
const StravaStrategy = require('passport-strava-oauth2').Strategy;

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
  scope: 'activity:write,activity:read_all'
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

router.get('/strava', passport.authenticate('strava'));

router.get('/strava/callback', passport.authenticate('strava', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
});

router.get('/exchange_token', async (req, res) => {
  try {
    const code = req.query?.code;
    const record = await getItem(1);
  
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
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = {
  authRouter: router,
};
