import { defineStore } from 'pinia';
import requestor from '@/utils/requestor';
import { emptyArray } from '@/constants';

export const useActivitiesStore = defineStore('activities', {
  state: () => ({
    activities: {} as Record<number, Activity>,
    activitiesOrder: [] as number[],
    details: {} as Record<number, ActivityDetails>,
    summary: {} as any,
    streams: {} as Record<number, { stream: (Stream | LatLngStream)[] }>,
    similarWorkouts: {} as Record<number, number[]>,
    similarWorkoutsMeta: {} as Record<number, TODO>,
    loading: false as boolean,
    error: undefined as any,
    heatMap: {} as Record<string, Array<HeatMapData>>,
  }),
  actions: {
    setActivitiesAction(payload: any[]) {
      const activitiesOrder = payload.map(({ id }) => id);

      for (let i = 0; i < payload.length; i++) {
        const activity = payload[i];
        const zonesCaches = activity.zonesCaches?.map((zoneCache: HeartZoneCache) => [zoneCache.heartZoneId, zoneCache]) || emptyArray;
        activity.zonesCaches = Object.fromEntries(zonesCaches);
        this.activities[activity.id] = activity;
      }

      this.activitiesOrder = this.activitiesOrder.concat(activitiesOrder);
    },
    async fetchActivities() {
      const eventSource = requestor.stream('/activities/listStream');
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.setActivitiesAction(data);
      };
    },
  },
  getters: {
    dateOrderedActivities: (state) => {
      const activities = state.activitiesOrder.map((id) => state.activities[id]);
      activities.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
      return activities
    }
  }
});
