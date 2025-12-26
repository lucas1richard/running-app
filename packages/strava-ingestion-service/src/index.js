const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { setupCouchDb } = require('./setupdb-couchbase');
const { initMysql } = require('./setupdb-mysql');
const { getRedisClient } = require('./redis');
const { getRabbitMQConnection } = require('./messageQueue/rabbitmq');
const { fetchNewActivities } = require('./fetchNewActivities');
const { getChannel, channelConfigs } = require('./messageQueue/channels');
const ingestActivityDetails = require('./ingestActivityDetails');
const ingestActivityStreams = require('./ingestActivityStreams');
const receiver = require('./messageQueue/receiver');
const ingestActivityLaps = require('./ingestActivityLaps');
const updateActivity = require('./updateActivity');
const { calculateBestEffortsForNewActivities } = require('./calculateBestEffortsForNewActivities');

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

  for (const recordId of addedRecordIds) {
    // add streams and details to the back of the queue
    receiver.sendMessage('stravaIngestionService', 'details', recordId);
    receiver.sendMessage('stravaIngestionService', 'streams', recordId);
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
        const { correlationId } = msg.properties;
        if (type === 'basic') {
          const ids = await fetchNewActivities(payload);
          receiver.sendMessage('activitiesService', 'basic-response', ids, correlationId);
          for (const recordId of ids) {
            // add streams and details request to the back of the queue
            receiver.sendMessage('stravaIngestionService', 'details', recordId);
            receiver.sendMessage('stravaIngestionService', 'streams', recordId);
          }
        }
        if (type === 'streams') {
          await ingestActivityStreams(payload);
          await calculateBestEffortsForNewActivities([payload]);
          receiver.sendMessage('activitiesService', 'streams-response', payload, correlationId);
        }
        if (type === 'details') {
          await ingestActivityDetails(payload);
          receiver.sendMessage('activitiesService', 'details-response', payload, correlationId);
        }
        if (type === 'laps') {
          await ingestActivityLaps(payload);
          receiver.sendMessage('activitiesService', 'laps-response', payload, correlationId);
        }
        if (type === 'update') {
          const stravaRes = await updateActivity(payload);
          receiver.sendMessage('activitiesService', 'update-response', stravaRes, correlationId);
        }
        basicDataChannel.ack(msg);
      }
    }, { noAck: false });
  })()
}

