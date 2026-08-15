import fetchIntervalsIcu from './fetch-intervalsicu.ts';
import type { ICU_API_Response } from './intervalsicu.types.ts';

/**
 * Fetches the data streams for a specific Intervals.icu activity.
 * @param activityId The ICU activity ID.
 * @returns The streams data as a map of stream names to number arrays.
 */
const fetchIntervalsIcuStreams = async (activityId: string | number) => {
  const path = `/activity/${activityId}/streams`;
  const streams = await fetchIntervalsIcu<ICU_API_Response.ICU_Streams>(path, {
    queryParams: {
      includeDefaults: true,
    },
  });
  return streams;
};

export default fetchIntervalsIcuStreams;
