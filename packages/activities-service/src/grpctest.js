const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

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

const client = new activityMatching.ActivityMatching(
  'activity-matching-service:50051',
  grpc.credentials.createInsecure()
);

client.hello({ name: 'World' }, (error, response) => {
  if (error) console.error('Error:', error);
  else console.log('WOWOWOW:', response.message);
});
