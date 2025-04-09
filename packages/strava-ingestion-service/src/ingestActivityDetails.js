const fetchStrava = require('./fetchStrava');
const { addActivityDetail } = require('./setupdb-couchbase');

const ingestActivityDetails = async (activityId) => {
  try {
    const activitiesDetails = await fetchStrava(`/activities/${activityId}`);
    await addActivityDetail(activitiesDetails);

    return { activityId, status: 'success' };
  } catch (err) {
    console.error('Error adding activity details:', err, console.trace());
    return { activityId, status: 'error', error: err.message };
  }
};

module.exports = ingestActivityDetails;
