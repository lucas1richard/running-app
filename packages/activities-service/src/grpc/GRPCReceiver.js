const { EventEmitter } = require('node:events');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const waitPort = require('wait-port');

class GRPCReceiver extends EventEmitter {
  /**
   * @param {{ serviceName: string, servicePort: string | number, protoPackage: string, protoService: string }} param0
   */
  constructor({ serviceName, servicePort, protoPackage, protoService, grpcOptions }) {
    super();
    this.serviceName = serviceName;
    this.servicePort = servicePort;
    this.protoPackage = protoPackage;
    this.protoService = protoService;
    this.grpcOptions = {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      ...grpcOptions,
    };
    this.client = null;
  }

  async init() {
    if (this.client) {
      return this;
    }
    await waitPort({
      host: this.serviceName,
      port: this.servicePort,
      timeout: 10000,
      waitForDns: true
    });
    const protoPath = `/protos/${this.serviceName}.proto`;
    const packageDefinition = protoLoader.loadSync(protoPath,this.grpcOptions);
    const ClientConstructor = grpc.loadPackageDefinition(packageDefinition)[this.protoPackage];

    this.client = new ClientConstructor[this.protoService](
      `${this.serviceName}:${this.servicePort}`,
      grpc.credentials.createInsecure()
    );

    return this;
  }

  /**
   * Make a gRPC request to the `this.serviceName` service.
   * @param {string} methodName The endpoint to call
   * @param {object} requestMessage The request message to send
   */
  async request(methodName, requestMessage) {
    if (!this.client) await this.init();
    if (!this.client[methodName]) {
      throw new Error(`Method ${methodName} not found on client. Check ${this.serviceName}.proto files here and in the service.`);
    }
    if (!requestMessage) {
      throw new Error(`Request message is required for method ${methodName}`);
    }
    if (typeof requestMessage !== 'object') {
      throw new Error(`Request message must be an object for method ${methodName}`);
    }
    if (Array.isArray(requestMessage)) {
      throw new Error(`Request message cannot be an array for method ${methodName}`);
    }
    return new Promise((res, rej) => this.client[methodName](requestMessage, (err, response) => {
      if (err) return rej(err);
      return res(response);
    }));
  }
}

module.exports = GRPCReceiver;
