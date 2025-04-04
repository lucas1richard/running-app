const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, '../../protos/activity-matching-service.proto'),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);
const activityMatching = grpc.loadPackageDefinition(packageDefinition).activityMatching;

function hello(call, callback) {
  console.log('Hello called');
  callback(null, { message: 'Hello from the server!' });
}

function getServer() {
  const server = new grpc.Server();
  server.addService(activityMatching.ActivityMatching.service, {
    hello,
  });
  return server;
}

if (require.main === module) {
  // If this is run as a script, start a server on an unused port
  const routeServer = getServer();
  routeServer.bindAsync(
    `${process.env.SERVICE_NAME}:${process.env.SERVICE_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log(`Running on port ${process.env.SERVICE_PORT}`);

    }
  );
}

