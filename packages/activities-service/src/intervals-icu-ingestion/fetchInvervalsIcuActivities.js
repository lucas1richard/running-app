const fetchIntervalsIcu = require('./fetch-intervalsicu');

const fetchIntervalsIcuActivities = async (oldest = '2026-06-29') => {
  const activities = await fetchIntervalsIcu('/activities', { queryParams: { oldest } });
  return activities;
};

module.exports = fetchIntervalsIcuActivities;
