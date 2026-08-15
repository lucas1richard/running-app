import type { ICU_API_Response } from './intervalsicu.types.ts';
import fetchIntervalsIcu from './fetch-intervalsicu.ts';

const INTERVALS_ICU_ATHLETE_ID = process.env.INTERVALS_ICU_ATHLETE_ID;

const fetchIntervalsIcuActivities = async (oldest = '2026-06-29') => {
  const activities = await fetchIntervalsIcu<ICU_API_Response.ICU_Activity[]>(`/athlete/${INTERVALS_ICU_ATHLETE_ID}/activities`, { queryParams: { oldest } });
  return activities;
};

export default fetchIntervalsIcuActivities;
