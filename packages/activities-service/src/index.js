const app = require('./app');
const PORT = require('./port');
const { setupdb } = require('./persistence/setupdb-couchbase');
const { initMysql } = require('./persistence/setupdb-mysql');
const { initSequelize } = require('./persistence/sequelize-init');
const waitPort = require('wait-port');
const { run } = require('./kafka/client');

const { activitiesRouter } = require('./routes/activities');
const { adminRouter } = require('./routes/admin');
const { authRouter } = require('./routes/authenticate');
const { heartzonesRouter } = require('./routes/heartzones');
const { analysisRouter } = require('./routes/analysis');
const { userRouter } = require('./routes/user');
const { segmentsRouter } = require('./routes/segments');
const { activityRoutesRouter } = require('./routes/activity-routes');

app.use('/activities', activitiesRouter);
app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/auth', authRouter);
app.use('/heartzones', heartzonesRouter);
app.use('/analysis', analysisRouter);
app.use('/user', userRouter);
app.use('/segments', segmentsRouter);
app.use('/routes', activityRoutesRouter);

setupdb()
  .then(initMysql)
  .then(initSequelize)
  .then(() => {
    return new Promise((ac, rej) => app.listen(PORT, (err) => {
      if (err) {
        console.log('connect', err);
        return rej(err);
      }
      console.log(`strava-client listening on port ${PORT}`);
      ac();
    }));
  })
  .then(() => waitPort({ 
      host: 'running-app-kafka', 
      port: 9092,
      timeout: 10000,
      waitForDns: true,
    })
  )
  .then(() => run())
  .catch((err) => {
    console.log('Error starting strava-client', err);
  });
