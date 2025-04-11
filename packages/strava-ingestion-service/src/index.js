const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const waitPort = require('wait-port');
const { setupCouchDb } = require('./setupdb-couchbase');
const { initMysql } = require('./setupdb-mysql');
const { fetchNewActivities } = require('./fetchNewActivities');
const { getRabbitMQConnection } = require('./messageQueue/rabbitmq');
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
    const streamsDataChannel = await getChannel(channelConfigs.fetchActivityStreams);
    const detailsDataChannel = await getChannel(channelConfigs.fetchActivityDetails);

    basicDataChannel.prefetch(1);
    streamsDataChannel.prefetch(1);
    detailsDataChannel.prefetch(1);

    // expect message to be in the format { perPage = 100, page = 1, fetchAll = false }
    await basicDataChannel.consume(channelConfigs.stravaIngestionService.queueName, async (msg) => {
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
    }, { noAck: false });
    await Promise.all([
      streamsDataChannel.consume(channelConfigs.fetchActivityStreams.queueName, async (msg) => {
        if (msg !== null) {
          const data = JSON.parse(msg.content.toString());
          await ingestActivityStreams(data);
          streamsDataChannel.ack(msg);
        }
      }, { noAck: false }),
      detailsDataChannel.consume(channelConfigs.fetchActivityDetails.queueName, async (msg) => {
        if (msg !== null) {
          const data = JSON.parse(msg.content.toString());
          await ingestActivityDetails(data);
          detailsDataChannel.ack(msg);
        }
      }, { noAck: false }),
    ]);
  })()
}

