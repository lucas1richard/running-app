import { defineStore } from 'pinia';
import requestor from '@/utils/requestor';

export const useActivitiesStore = defineStore('activities', {
  state: () => ({
    activities: [] as any[],
    activity: {} as any,
  }),
  actions: {
    async fetchActivities() {
      const eventSource = requestor.stream('/activities/listStream');
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.activities = this.activities.concat(data);
      };
    },
  },
});
