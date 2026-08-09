import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};

const clients = new Map();

/**
 * @param {{ serviceName: string, servicePort: string | number, protoPackage: string, protoService: string }} param0
 */
const getGrpcClient = ({ serviceName, servicePort, protoPackage, protoService }) => {
  if (clients.has(serviceName)) {
    return clients.get(serviceName);
  }
  const packageDefinition = protoLoader.loadSync(
    `/protos/${serviceName}.proto`,
    options
  );
  const serviceClientConstructor = grpc.loadPackageDefinition(packageDefinition)[protoPackage];

  const client = new serviceClientConstructor[protoService](
    `${serviceName}:${servicePort}`,
    grpc.credentials.createInsecure()
  );

  clients.set(serviceName, client);

  return client
};

export { getGrpcClient };
