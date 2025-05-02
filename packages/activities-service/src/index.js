const app = require('./app');
const PORT = require('./port');

const { setupdb } = require('./persistence/setupdb-couchbase');
const { initMysql } = require('./persistence/setupdb-mysql');
const { initSequelize } = require('./persistence/sequelize-init');

const { getRabbitMQConnection } = require('./messageQueue/rabbitmq');

const { activitiesRouter } = require('./routes/activities');
const { adminRouter } = require('./routes/admin');
const { authRouter } = require('./routes/authenticate');
const { heartzonesRouter } = require('./routes/heartzones');
const { analysisRouter } = require('./routes/analysis');
const { userRouter } = require('./routes/user');
const { segmentsRouter } = require('./routes/segments');
const { activityRoutesRouter } = require('./routes/activity-routes');
const { routeCoordinatesRouter } = require('./routes/routeCoordinates');

const { logger } = require('./utils/logger');
const { getChannel, channelConfigs } = require('./messageQueue/channels');
const addAllCompressedRoutes = require('./functions/addAllCompressedRoutes');

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

(async () => {
  try {
    await setupdb();
    await initMysql();
    await initSequelize();

    await getRabbitMQConnection();
    await Promise.all([
      getChannel(channelConfigs.stravaIngestionService),
      getChannel(channelConfigs.activitiesService)
    ]);

    await app.listen(PORT);

    // await addAllCompressedRoutes();

    logger.info({ message: `strava-client listening on port ${PORT}`});
  } catch (err) {
    logger.error({ message: 'Error starting strava-client' });
    console.trace(err)
  }
})();
