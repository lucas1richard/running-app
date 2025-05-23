import { useApiCallback } from '@/stores/apiStatus';
import { defineStore } from 'pinia';
import requestor from '@/utils/requestor';
import { emptyArray } from '@/constants';
import { computed, reactive, ref } from 'vue';

export const useActivitiesStore = defineStore('activities', () => {
  const makeApiCallback = useApiCallback();
  
  const activities = reactive<Record<number, Activity>>({});
  const activitiesOrder = ref<number[]>([]);
  const details = reactive<Record<number, ActivityDetails>>({});
  const summary = reactive<any>({});
  const streams = reactive<Record<number, { stream: (Stream | LatLngStream)[] }>>({});
  const similarWorkouts = reactive<Record<number, number[]>>({});
  const similarWorkoutsMeta = reactive<Record<number, TODO>>({});
  const heatMap = reactive<Record<string, Array<HeatMapData>>>({});

  function setActivitiesAction(payload: any[]) {
    const newActivitiesOrder = payload.map(({ id }) => id).filter(id => !activities[id]);

    activitiesOrder.value = activitiesOrder.value.concat(newActivitiesOrder);
    for (let i = 0; i < payload.length; i++) {
      const activity = payload[i];
      const zonesCaches = activity.zonesCaches?.map((zoneCache: HeartZoneCache) => [zoneCache.heartZoneId, zoneCache]) || emptyArray;
      activity.zonesCaches = Object.fromEntries(zonesCaches);
      activities[activity.id] = activity;
    }
  }

  async function fetchActivitiesCb() {
    const eventSource = requestor.stream('/activities/listStream');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setActivitiesAction(data);
    };
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

  const dateOrderedActivities = computed(() => activitiesOrder.value
    .map((id) => activities[id])
    .sort((a, b) => new Date(b.start_date_local).getTime() - new Date(a.start_date_local).getTime()));

  return {
    activities,
    activitiesOrder,
    details,
    summary,
    streams,
    similarWorkouts,
    similarWorkoutsMeta,
    heatMap,
    dateOrderedActivities,
    fetchActivities: makeApiCallback('fetchActivities', fetchActivitiesCb),
    makeFetchHeatMapData: fetchHeatMapDataCb,
  };
});
