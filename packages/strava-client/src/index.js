const app = require('./app');
const PORT = require('./port');
const { setupdb } = require('./database/setupdb-couchbase');
const { initMysql } = require('./database/setupdb-mysql');
const { initSequelize } = require('./database/sequelize-init');
const { activitiesRouter } = require('./routes/activities');
const { adminRouter } = require('./routes/admin');
const { authRouter } = require('./routes/authenticate');
const { heartzonesRouter } = require('./routes/heartzones');
const { analysisRouter } = require('./routes/analysis');
const { userRouter } = require('./routes/user');

app.use('/activities', activitiesRouter);
app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/auth', authRouter);
app.use('/heartzones', heartzonesRouter);
app.use('/analysis', analysisRouter);
app.use('/user', userRouter);

setupdb()
  .then(initMysql)
  .then(initSequelize)
  .then(() => {
    app.listen(PORT, (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`strava-client listening on port ${PORT}`);
    });
  })
  .catch(console.log);
