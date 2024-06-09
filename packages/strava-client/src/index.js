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
const waitPort = require('wait-port');
const { run } = require('./kafka/client');
const { segmentsRouter } = require('./routes/segments');

app.use('/activities', activitiesRouter);
app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/auth', authRouter);
app.use('/heartzones', heartzonesRouter);
app.use('/analysis', analysisRouter);
app.use('/user', userRouter);
app.use('/segments', segmentsRouter);

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
