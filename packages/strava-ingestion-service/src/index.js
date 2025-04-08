const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const waitPort = require('wait-port');
const { setupdb } = require('./setupdb-couchbase');
const { initMysql } = require('./setupdb-mysql');
const { fetchNewActivities } = require('./fetchNewActivities');
const { getRabbitMQConnection } = require('./messageQueue/rabbitmq');
const { getChannel, channelConfigs } = require('./messageQueue/channels');
const { getActivityStreams } = require('./getActivityStreams');
const ingestActivityDetails = require('./ingestActivityDetails');

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
  console.log('fetchActivities called');
  const addedRecordIds = await fetchNewActivities(call.request);

  const streamsDataChannel = await getChannel(channelConfigs.fetchActivityStreams);
  const detailsDataChannel = await getChannel(channelConfigs.fetchActivityDetails);

  for (const recordId of addedRecordIds) {
    // add streams and details to the back of the queue
    streamsDataChannel.publish(
      channelConfigs.fetchActivityStreams.exchangeName,
      channelConfigs.fetchActivityStreams.routingKey,
      Buffer.from(String(recordId))
    );
    detailsDataChannel.publish(
      channelConfigs.fetchActivityDetails.exchangeName,
      channelConfigs.fetchActivityDetails.routingKey,
      Buffer.from(String(recordId))
    );
  }

  callback(null, { activityId: addedRecordIds });
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
      setupdb(),
      initMysql(),
      waitPort({ host: 'rabbitmq', port: 5672, timeout: 10000, waitForDns: true }),
    ]);

    await getRabbitMQConnection();

    const routeServer = getServer();
    routeServer.bindAsync(
      `${process.env.SERVICE_NAME}:${process.env.SERVICE_PORT}`,
      grpc.ServerCredentials.createInsecure(),
      () => {
        console.log(`Running on port ${process.env.SERVICE_PORT}`);
      }
    );

    const basicDataChannel = await getChannel(channelConfigs.stravaIngestionService);
    const streamsDataChannel = await getChannel(channelConfigs.fetchActivityStreams);
    const detailsDataChannel = await getChannel(channelConfigs.fetchActivityDetails);

    // expect message to be in the format { perPage = 100, page = 1, fetchAll = false }
    basicDataChannel.consume(channelConfigs.stravaIngestionService.queueName, async (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        const addedRecordIds = await fetchNewActivities(data);
        basicDataChannel.ack(msg);

        for (const recordId of addedRecordIds) {
          // add streams and details to the back of the queue
          streamsDataChannel.publish(
            channelConfigs.fetchActivityStreams.exchangeName,
            channelConfigs.fetchActivityStreams.routingKey,
            Buffer.from(String(recordId))
          );
          detailsDataChannel.publish(
            channelConfigs.fetchActivityDetails.exchangeName,
            channelConfigs.fetchActivityDetails.routingKey,
            Buffer.from(String(recordId))
          );
        }
      }
    });
    streamsDataChannel.consume(channelConfigs.fetchActivityStreams.queueName, async (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        await getActivityStreams(data);
        streamsDataChannel.ack(msg);
      }
    });
    detailsDataChannel.consume(channelConfigs.fetchActivityDetails.queueName, async (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        await ingestActivityDetails(data);
        detailsDataChannel.ack(msg);
      }
    });
  })()
}

