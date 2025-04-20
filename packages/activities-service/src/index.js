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
const waitPort = require('wait-port');
const { getGrpcClient } = require('./grpctest');

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

    waitPort({ host: 'activities-go-server', port: 50051, timeout: 10000, waitForDns: true })
    console.log('gRPC server is ready...');
    const grpcClient = getGrpcClient({
      serviceName: 'activities-go-server',
      servicePort: 50051,
      protoPackage: 'activityMatching',
      protoService: 'ActivityMatching'
    })

    grpcClient.getLongestCommonSubsequence({ base: '14207820024', compare: '13875355229' }, (err, response) => {
      if (err) {
        console.error('Error:', err.message);
        return;
      }
      console.log('Greeting:', response);
    });


    await app.listen(PORT);
    logger.info({ message: `strava-client listening on port ${PORT}`});
  } catch (err) {
    logger.error({ message: 'Error starting strava-client' });
    console.trace(err)
  }
})();
