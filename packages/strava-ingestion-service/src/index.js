const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const waitPort = require('wait-port');
const { setupCouchDb } = require('./setupdb-couchbase');
const { initMysql } = require('./setupdb-mysql');
const { getRedisClient } = require('./redis');
const { getRabbitMQConnection } = require('./messageQueue/rabbitmq');
const { fetchNewActivities } = require('./fetchNewActivities');
const { getChannel, channelConfigs } = require('./messageQueue/channels');
const ingestActivityDetails = require('./ingestActivityDetails');
const ingestActivityStreams = require('./ingestActivityStreams');

const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, '../../protos/strava-ingestion-service.proto'),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const stravaIngestion = grpc.loadPackageDefinition(packageDefinition).stravaIngestion;

async function fetchNewActivitiesEndpoint(call, callback) {
  console.trace('fetchActivities called');
  const addedRecordIds = await fetchNewActivities(call.request);
  callback(null, { activityId: addedRecordIds });

  const basicDataChannel = await getChannel(channelConfigs.stravaIngestionService);

  for (const recordId of addedRecordIds) {
    // add streams and details to the back of the queue
    basicDataChannel.publish(
      channelConfigs.stravaIngestionService.exchangeName,
      channelConfigs.stravaIngestionService.routingKey,
      Buffer.from(String(recordId))
    );
    basicDataChannel.publish(
      channelConfigs.stravaIngestionService.exchangeName,
      channelConfigs.stravaIngestionService.routingKey,
      Buffer.from(String(recordId))
    );
  }
}


function getServer() {
  const server = new grpc.Server();
  server.addService(stravaIngestion.StravaIngestion.service, {
    fetchNewActivities: fetchNewActivitiesEndpoint,
  });
  return server;
}

if (require.main === module) {
  // If this is run as a script, start a server on an unused port
  (async () => {
    await Promise.all([
      setupCouchDb(),
      initMysql(),
      waitPort({ host: 'rabbitmq', port: 5672, timeout: 10000, waitForDns: true }),
      getRedisClient(),
    ]);

    await getRabbitMQConnection();

    const routeServer = getServer();
    routeServer.bindAsync(
      `${process.env.SERVICE_NAME}:${process.env.SERVICE_PORT}`,
      grpc.ServerCredentials.createInsecure(),
      () => {
        console.trace(`Running on port ${process.env.SERVICE_PORT}`);
      }
    );

    const basicDataChannel = await getChannel(channelConfigs.stravaIngestionService);

    basicDataChannel.prefetch(1);

    // expect message to be in the type, payload: { perPage = 100, page = 1, fetchAll = false }
    basicDataChannel.consume(channelConfigs.stravaIngestionService.queueName, async (msg) => {
      if (msg !== null) {
        const { payload, type } = JSON.parse(msg.content.toString());
        if (type === 'basic') {
          const ids = await fetchNewActivities(payload);
          const channel = await getChannel(channelConfigs.activitiesService);
          channel.publish(
            channelConfigs.activitiesService.exchangeName,
            channelConfigs.activitiesService.routingKey,
            Buffer.from(JSON.stringify({ type: 'basic-response', payload: ids })),
            { correlationId: msg.properties.correlationId }
          );
        }
        if (type === 'streams') await ingestActivityStreams(payload);
        if (type === 'details') await ingestActivityDetails(payload);
        basicDataChannel.ack(msg);
      }
    }, { noAck: false });
  })()
}

