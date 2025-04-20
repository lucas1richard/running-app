const GRPCReceiver = require('./GRPCReceiver');

const activityMatchingReceiver = new GRPCReceiver({
  serviceName: 'activities-go-server',
  servicePort: 50051,
  protoPackage: 'activityMatching',
  protoService: 'ActivityMatching'
});

module.exports = activityMatchingReceiver;