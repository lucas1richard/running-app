const waitPort = require('wait-port');

const app = require('./app');
const PORT = require('./port');
const { setupdb } = require('./persistence/setupdb-couchbase');
const { initMysql } = require('./persistence/setupdb-mysql');
const { initSequelize } = require('./persistence/sequelize-init');

const { setupConsumers } = require('./messageQueue/consumers');

const { activitiesRouter } = require('./routes/activities');
const { adminRouter } = require('./routes/admin');
const { authRouter } = require('./routes/authenticate');
const { heartzonesRouter } = require('./routes/heartzones');
const { analysisRouter } = require('./routes/analysis');
const { userRouter } = require('./routes/user');
const { segmentsRouter } = require('./routes/segments');
const { activityRoutesRouter } = require('./routes/activity-routes');
const { logger } = require('./utils/logger');
const { routeCoordinatesRouter } = require('./routes/routeCoordinates');
const { dispatchFanout } = require('./messageQueue/client');
const { rpcRouter } = require('./routes/rpc');

app.use('/activities', activitiesRouter);
app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/auth', authRouter);
app.use('/heartzones', heartzonesRouter);
app.use('/analysis', analysisRouter);
app.use('/user', userRouter);
app.use('/segments', segmentsRouter);
app.use('/routes', activityRoutesRouter);
app.use('/routeCoordinates', routeCoordinatesRouter);
app.use('/rpc', rpcRouter);

(async () => {
  try {
    await setupdb();
    await initMysql();
    await initSequelize();

    await app.listen(PORT);
    logger.log({ message: `strava-client listening on port ${PORT}`});

    await waitPort({
      host: 'rabbitmq',
      port: 5672,
      timeout: 10000,
      waitForDns: true,
    });

    await setupConsumers();

    //
    await dispatchFanout('Hello', 'World');
  } catch (err) {
    logger.error({ message: 'Error starting strava-client', err });
  }
})();