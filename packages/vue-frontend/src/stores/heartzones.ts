import requestor from '@/utils/requestor';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useApiCallback } from './apiStatus';

const useHeartZonesStore = defineStore('heartzones', () => {
  const makeApiCallback = useApiCallback();
  const record = ref<any[]>([]);

  async function fetchHeartZonesCb() {
    const res = await requestor.get('/heartzones');
    if (res.status === 200) {
      const data = await res.json();
      record.value = data;
    }
  }
  
  const selectHeartZones = computed(() => (date: string) => {
    const currDate = new Date(date);
    return record.value.find(({ start_date }) => new Date(start_date) < currDate) || {};
  });
  
  return {
    record,
    fetchHeartZones: makeApiCallback('fetchHeartZones', fetchHeartZonesCb),
    selectHeartZones,
  };
});

export default useHeartZonesStore;
