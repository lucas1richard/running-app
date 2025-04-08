const { addStream } = require('./setupdb-couchbase');
const fetchStrava = require('./fetchStrava');

const streamKeys = [
  'time',
  'distance',
  'latlng',
  'altitude',
  'velocity_smooth',
  'heartrate',
  'cadence',
  'watts',
  'temp',
  'moving',
  'grade_smooth',
];

const getActivityStreams = async (activityId) => {
  try {
    const stream = await fetchStrava(`/activities/${activityId}/streams?keys=${streamKeys.join(',')}`);
    await addStream({ stream }, activityId);
    return { activityId, status: 'success' };
  } catch (err) {
    console.error('Error adding stream:', err);
    return { activityId, status: 'error', error: err.message };
  }
};

module.exports = {
  getActivityStreams,
};