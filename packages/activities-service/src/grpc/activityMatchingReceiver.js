const GRPCReceiver = require('./GRPCReceiver');
const { getStream } = require('../persistence/setupdb-couchbase');

class ActivityMatchingReceiver extends GRPCReceiver {
  constructor(options) {
    super(options);
  }

  /**
   * @param {number} activityId The activity id for which to get the compressed route
   * @returns {Promise<Array<{lat: string, lon: string, sec: number}>>} The compressed route
   */
  async getCompressedRouteForActivity(activityId) {
    const streams = await getStream(activityId);
    const route = streams.stream.find(({ type }) => type === 'latlng').data;
    const rr = await this.request('getCompactedRoute', {
      route: route.map((a) =>({ lat:a[0], lon: a[1] })),
    });

    return rr.compactedRoute;
  }

  /**
   * Gets the longest common coordinate subsequence between two activities using their compressed
   * routes
   * @param {number} activityId The base activity id
   * @param {Array<number>} compareIds The activity ids to compare with
   * @returns {Promise<Record<string, { activityId: string, longestCommonSubsequence: number, error: boolean }>>}
   */
  async getLongestCommonSubsequence(activityId, compareIds) {
    const res = await this.request('getLongestCommonSubsequence', {
      base: activityId,
      compare: compareIds,
    });

    return res.longestCommonSubsequence;
  }
}

const activityMatchingReceiver = new ActivityMatchingReceiver({
  serviceName: 'activities-go-server',
  servicePort: 50051,
  protoPackage: 'activityMatching',
  protoService: 'ActivityMatching'
});

module.exports = activityMatchingReceiver;