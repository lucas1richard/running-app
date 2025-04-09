const { getActivityStreams } = require('./getActivityStreams');

const distances = [
  { name: '100 yards', distance: 91.44 },
  { name: '100m', distance: 100 },
  { name: '400m', distance: 400 },
  { name: '1/2 mile', distance: 805 },
  { name: '1K', distance: 1e3 },
  { name: '1 mile', distance: 1609 },
  { name: '2 mile', distance: 3219 },
  { name: '5K', distance: 5e3 },
  { name: '10K', distance: 10e3 },
  { name: '20K', distance: 20e3 },
  { name: '1/2 Marathon', distance: 21097.5 },
  { name: '30K', distance: 30e3 },
  { name: '40K', distance: 40e3 },
  { name: 'Marathon', distance: 42195 },
  { name: '50K', distance: 50e3 },
  { name: '100K', distance: 100e3 },
];

const calculateActivityBestEfforts = async (activityId, meterDistances = distances) => {
  const streams = await getActivityStreams(activityId, ['distance', 'time']);
  const distanceStream = streams?.find(({ type }) => type === 'distance')?.data;
  const timeStream = streams?.find(({ type }) => type === 'time')?.data;

  if (!distanceStream || !timeStream) {
    console.warn(`activity ${activityId} is missing stream data, so calculateActivityBestEfforts returning empty array`, console.trace());
    return [];
  }

  const len = distanceStream.length;

  return meterDistances
    .filter(({ distance }) => distance <= distanceStream[len - 1])
    .map(({ name, distance }) => {
      let start = 0;
      let end = 0;
      let bestEffort = { name, distance, start: 0, end: 0, time: Infinity };

      while (end < len && start < len) {
        if (distanceStream[end] - distanceStream[start] >= distance) {
          const time = timeStream[end] - timeStream[start];
          if (time > 8 && time < bestEffort.time) {
            bestEffort = { name, distance, start, end, time };
          }

          start++;
        } else {
          end++;
        }
      }

      return bestEffort;
    });
};

module.exports = {
  calculateActivityBestEfforts,
};