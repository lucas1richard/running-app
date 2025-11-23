import { useApiCallback } from '@/stores/apiStatus';
import { defineStore } from 'pinia';
import requestor from '@/utils/requestor';
import { emptyArray } from '@/constants';
import { computed, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import usePreferencesStore from './preferences';

// interface SelectStreamTypeData<Multi = false> {
//   (id: Multi extends true ? number[] : number, findType: 'time'): Multi extends true ? Stream['data'][] : Stream['data'];
//   (id: Multi extends true ? number[] : number, findType: 'heartrate'): Multi extends true ? Stream['data'][] : Stream['data'];
//   (id: Multi extends true ? number[] : number, findType: 'distance'): Multi extends true ? Stream['data'][] : Stream['data'];
//   (id: Multi extends true ? number[] : number, findType: 'altitude'): Multi extends true ? Stream['data'][] : Stream['data'];
//   (id: Multi extends true ? number[] : number, findType: 'velocity_smooth'): Multi extends true ? Stream['data'][] : Stream['data'];
//   (id: Multi extends true ? number[] : number, findType: 'grade_smooth'): Multi extends true ? Stream['data'][] : Stream['data'];
//   (id: Multi extends true ? number[] : number, findType: 'latlng'): Multi extends true ? LatLngStream['data'][] : LatLngStream['data'];
// }

export const useActivitiesStore = defineStore('activities', () => {
  const makeApiCallback = useApiCallback();
  const prefsState = usePreferencesStore();

  const displayTypes = ref<Record<string, boolean>>({});
  const activities = reactive<Record<number, Activity>>({});
  const activitiesOrder = ref<number[]>([]);
  const details = reactive<Record<number, ActivityDetails>>({});
  const summary = reactive<TODO>({});
  const streams = reactive<Record<number, { stream: (Stream | LatLngStream)[] }>>({});
  const similarWorkouts = reactive<Record<number, number[]>>({});
  const similarWorkoutsMeta = reactive<Record<number, TODO>>({});
  const heatMap = reactive<Record<string, Array<HeatMapData>>>({});

  function setActivitiesAction(payload: TODO[]) {
    const newActivitiesOrder = payload.map(({ id }) => id).filter(id => !activities[id]);

    activitiesOrder.value = activitiesOrder.value.concat(newActivitiesOrder);
    const types = displayTypes.value;

    for (let i = 0; i < payload.length; i++) {
      const activity = payload[i];
      types[activity.type] = true;
      const zonesCaches = activity.zonesCaches?.map((zoneCache: HeartZoneCache) => [zoneCache.heartZoneId, zoneCache]) || emptyArray;
      activity.zonesCaches = Object.fromEntries(zonesCaches);
      activities[activity.id] = activity;
    }
    displayTypes.value = types;
  }

  async function fetchActivitiesCb() {
    const eventSource = requestor.stream('/activities/listStream');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setActivitiesAction(data);
    };
  }

  function fetchSimilarActivities(id: number) {
    const key = `fetchSimilarWorkouts/${id}`;
    return makeApiCallback(key, async () => {
      const res = await requestor.get(`/activities/${id}/quick-similar`);
      const sim = await res.json();
      if (!similarWorkouts[id]) similarWorkouts[id] = [];
      similarWorkouts[id] = sim.map(({ relatedActivity }: {relatedActivity: number}) => relatedActivity);
      similarWorkoutsMeta[id] = Object.fromEntries(sim.map((c: TODO) => [c.relatedActivity, c]));
    });
  }

  function fetchHeatMapDataCb(timeframe?: string, referenceTime?: string) {
    const data: HeatMapData[] = [];
    const queryParam = new URLSearchParams({
      ...timeframe ? { timeframe } : {},
      ...referenceTime ? { referenceTime } : {},
    });
    const key = [timeframe, referenceTime].filter(Boolean).join('|') || 'all';
    if (!heatMap[key]) heatMap[key] = [];
    return makeApiCallback(key, async () => {
      const eventSource = requestor.stream(`/routeCoordinates/heatmap${queryParam ? '?' + queryParam : ''}`);
      eventSource.onmessage = (event) => {
        const res = JSON.parse(event.data);
        data.push(res);
      }
      eventSource.addEventListener('close', () => {
        heatMap[key] = data.flat();
      });
    });
  }

  function makeFetchActivityDetail(id: number) {
    return makeApiCallback(`activityDetail/${id}`, async () => {
      const res = await requestor.get(`/activities/${id}/detail`);
      if (res.status === 200) {
        const detail = await res.json();
        details[id] = detail;
      } else {
        throw new Error(`Failed to fetch activity detail: ${res.statusText}`);
      }
    });
  }

  function makeFetchActivityStreams(id: number) {
    const streamTypes: SimpleStreamTypes[] = [
      'heartrate', 'velocity_smooth', 'latlng', 'altitude', 'time', 'grade_smooth', 'distance'
    ];
    return makeApiCallback(`activityStreams/${id}`, async () => {
      const typesQuery = new URLSearchParams({ keys: streamTypes });
      const res = await requestor.get(`/activities/${id}/streams?${typesQuery}`);
      if (res.status === 200) {
        const stream = await res.json();
        streams[id] = stream;
      } else {
        throw new Error(`Failed to fetch activity streams: ${res.statusText}`);
      }
    });
  }

  const getStreamTypeData = <F extends SimpleStreamTypes>(id: number, findType: F) => {
    const stream = streams[id]?.stream?.find?.(({ type }) => type === findType);
    return (stream?.data || emptyArray) as F extends 'latlng' ? LatLng[] : number[];
  };

  const getStreamTypeMulti = <F extends SimpleStreamTypes>(ids: number[], findType: F) => computed(
    () => ids.map((id) => {
      const stream = streams[id]?.stream?.find?.(({ type }) => type === findType)
      return (stream?.data || emptyArray) as F extends 'latlng' ? LatLng[] : number[];
    })
  )

  const getActivityDetailsMulti = (ids: number[]) => computed(() => ids.map((id) => details[id]));

  const dateOrderedActivities = computed(() => activitiesOrder.value
    .map((id) => activities[id])
    .filter(({ type }) => prefsState.global.defined.activityDisplayTypes[type])
    .sort((a, b) => new Date(b.start_date_local).getTime() - new Date(a.start_date_local).getTime()));

  const dateGroupedActivities = computed(() => {
    return dateOrderedActivities.value.reduce<Record<string, Activity[]>>((acc, activity) => {
      const date = dayjs(activity.start_date_local).format('YYYY-MM-DD');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    }, {});
  });

  const getSimilarWorkouts = (id: number) => (similarWorkouts[id] || [])
    .filter(Boolean)
    .sort((a, b) => similarWorkoutsMeta[b]?.longestCommonSegmentSubsequence - similarWorkoutsMeta[a]?.longestCommonSegmentSubsequence)
    .map((id) => activities[id]);

  const activitiesDisplayTypes = computed<Record<string, boolean>>(() => {
    return Object.assign({}, displayTypes.value, prefsState.global.defined.activityDisplayTypes || {});
  });

  return {
    activities,
    activitiesDisplayTypes,
    activitiesOrder,
    details,
    displayTypes,
    setDisplayTypes: (selected: (string|number)[]) => {
      displayTypes.value = Object.fromEntries(
        Object.entries(displayTypes.value).map(([key]) => [key, selected.includes(key)])
      )
      prefsState.global.defined.activityDisplayTypes = displayTypes.value;
    },
    summary,
    streams,
    similarWorkouts,
    similarWorkoutsMeta,
    heatMap,
    dateOrderedActivities,
    dateGroupedActivities,
    fetchActivities: makeApiCallback('fetchActivities', fetchActivitiesCb),
    makeSetchSimilarWorkouts: fetchSimilarActivities,
    makeFetchHeatMapData: fetchHeatMapDataCb,
    makeFetchActivityDetail,
    makeFetchActivityStreams,
    getActivityDetailsMulti,
    getSimilarWorkouts,
    getStreamTypeData,
    getStreamTypeMulti,
  };
});
