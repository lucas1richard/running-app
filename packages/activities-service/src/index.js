const waitPort = require('wait-port');

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

    await app.listen(PORT);
    logger.info({ message: `strava-client listening on port ${PORT}`});

    await waitPort({ host: 'rabbitmq', port: 5672, timeout: 10000, waitForDns: true });
    const connection = await getRabbitMQConnection();

    const defaultChannel = await connection.createChannel();
    await defaultChannel.assertExchange('defaultExchange', 'direct');
    await defaultChannel.deleteQueue('defaultQueue');
    await defaultChannel.deleteQueue('hmmQueue');
    await defaultChannel.deleteQueue('hmmQueue1');
    await defaultChannel.assertQueue('defaultQueue', { durable: false });
    await defaultChannel.assertQueue('hmmQueue', { durable: false });
    await defaultChannel.assertQueue('hmmQueue1', { durable: false });
    await defaultChannel.bindQueue('defaultQueue', 'defaultExchange', 'defaultRoutingKey');
    await defaultChannel.bindQueue('hmmQueue', 'defaultExchange', 'hmmRoutingKey');
    const anotherChannel = await connection.createChannel();

    console.time('timer');
    defaultChannel.prefetch(1);
    anotherChannel.prefetch(1);

    await anotherChannel.consume('defaultQueue', (msg) => {
      if (msg !== null) {
        console.timeLog('timer');
        console.info(`    [x] anotherChannel Received message from defaultQueue: ${msg.content.toString()}`);
        anotherChannel.ack(msg);
      }
    }, { noAck: false });

    await defaultChannel.consume('defaultQueue', (msg) => {
      if (msg !== null) {
        console.timeLog('timer');
        console.info(`    [x] defaultChannel Received message from defaultQueue: ${msg.content.toString()}`);
        defaultChannel.ack(msg);
      }
    }, { noAck: false });
    await defaultChannel.consume('hmmQueue', (msg) => {
      if (msg !== null) {
        console.timeLog('timer');
        console.info(`    [x] defaultChannel Received message from hmmQueue: ${msg.content.toString()}`);
        defaultChannel.ack(msg);
      }
    }, { noAck: false });
    await anotherChannel.consume('hmmQueue', async (msg) => {
      await new Promise((resolve) => {
          setTimeout(() => {
          if (msg !== null) {
          console.timeLog('timer');
          resolve();
        }
      }, 1000);
    });
      console.info(`    [x] anotherChannel Received message from hmmQueue: ${msg.content.toString()}
      `);
      anotherChannel.ack(msg);
    },  {
      noAck: false
    });
    await defaultChannel.publish('defaultExchange', 'defaultRoutingKey', Buffer.from('111'));
    await defaultChannel.publish('defaultExchange', 'hmmRoutingKey', Buffer.from('222'));
    await defaultChannel.publish('defaultExchange', 'hmmRoutingKey', Buffer.from('333'));
    await defaultChannel.publish('defaultExchange', 'hmmRoutingKey', Buffer.from('444'));
    await anotherChannel.publish('defaultExchange', 'hmmRoutingKey', Buffer.from('555'));
    await anotherChannel.publish('defaultExchange', 'hmmRoutingKey', Buffer.from('666'));
  } catch (err) {
    logger.error({ message: 'Error starting strava-client' });
    console.trace(err)
  }
})();
