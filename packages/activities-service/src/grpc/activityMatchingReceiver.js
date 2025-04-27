const { getStream } = require('../persistence/setupdb-couchbase');
const GRPCReceiver = require('./GRPCReceiver');

class ActivityMatchingReceiver extends GRPCReceiver {
  constructor(options) {
    super(options);
  }

  async getCompressedRouteForActivity(activityId) {
    const streams = await getStream(activityId);
    const route = streams.stream.find(({ type }) => type === 'latlng').data;
    return this.request('getCompactedRoute', {
      route: route.map((a) =>({ lat:a[0], lon: a[1] })),
    });
  }
}

const activityMatchingReceiver = new ActivityMatchingReceiver({
  serviceName: 'activities-go-server',
  servicePort: 50051,
  protoPackage: 'activityMatching',
  protoService: 'ActivityMatching'
});

module.exports = activityMatchingReceiver;