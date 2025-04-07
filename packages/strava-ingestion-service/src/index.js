const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const waitPort = require('wait-port');
const { setupdb } = require('./setupdb-couchbase');
const { initMysql } = require('./setupdb-mysql');
const { fetchNewActivities } = require('./fetchNewActivities');
const { getRabbitMQConnection } = require('./messageQueue/rabbitmq');

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
  const res = await fetchNewActivities(call.request);

  callback(null, { activityId: res });
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
  })()
}

