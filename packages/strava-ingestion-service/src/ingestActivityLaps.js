const fetchStrava = require('./fetchStrava');
const { updateActivityDetail } = require('./setupdb-couchbase');

const ingestActivityLaps = async (activityId) => {
  try {
    const laps = await fetchStrava(`/activities/${activityId}/laps`);
    await updateActivityDetail(activityId, { laps, has_detailed_laps: true });

    return { activityId, status: 'success' };
  } catch (err) {
    console.error('Error adding activity details:', err, console.trace());
    return { activityId, status: 'error', error: err.message };
  }
};

module.exports = ingestActivityLaps;
