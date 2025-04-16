const fetchStrava = require('./fetchStrava')

const updateActivity = async ({ activityId, updates }) => {
  try {
    const stravaRes = await fetchStrava(`/activities/${activityId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    return stravaRes;
  }

  catch (err) {
    return { error: err.message };
  }
}

module.exports = updateActivity
