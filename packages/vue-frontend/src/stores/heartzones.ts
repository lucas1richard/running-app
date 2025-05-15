import requestor from '@/utils/requestor';
import { defineStore } from 'pinia';

const useHeartZonesStore = defineStore('heartzones', {
  state: () => ({
    record: [] as any[],
  }),
  actions: {
    setHeartZonesAction(payload: any) {
      this.record = payload;
    },
    async fetchHeartZones() {
      const res = await requestor.get('/heartzones');
      if (res.status === 200) {
        const data = await res.json();
        this.setHeartZonesAction(data);
      }
    },
  },
  getters: {
    getHeartZones: (state) => (date: string) => {
      const currDate = new Date(date);
      return state.record.find(({ start_date }) => new Date(start_date) < currDate) || {};
    },
    getApplicableHeartZone: (state) => (date: string, nativeZones: any, configZonesId: number) => {
      const zonesId = configZonesId === -1 ? nativeZones.id : configZonesId;
      return state.record.find(({ id }) => id === zonesId) || nativeZones;
    },
  },
});

export default useHeartZonesStore;
