import fetchIntervalsIcu from './fetch-intervalsicu.js';

const fetchIntervalsIcuActivities = async (oldest = '2026-06-29') => {
  const activities = await fetchIntervalsIcu('/activities', { queryParams: { oldest } });
  return activities;
};

export default fetchIntervalsIcuActivities;
