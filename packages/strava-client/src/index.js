const app = require('./app');
const PORT = require('./port');
const { setupdb } = require('./database/setupdb-couchbase');
const { initMysql } = require('./database/setupdb-mysql');
const { activitiesRouter } = require('./routes/activities');
const { adminRouter } = require('./routes/admin');
const { authRouter } = require('./routes/authenticate');

app.use('/activities', activitiesRouter);
app.use('/admin', adminRouter);
app.use('/auth', authRouter);

setupdb()
  .then(initMysql)
  .then(() => {
    app.listen(PORT, (err) => {
      console.log(`strava-client listening on port ${PORT}`);
    });
  })
  .catch(console.log);
