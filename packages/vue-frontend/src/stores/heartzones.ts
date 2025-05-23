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
  
  const getHeartZones = computed(() => (date: string) => {
    const currDate = new Date(date);
    return record.value.find(({ start_date }) => new Date(start_date) < currDate) || {};
  });
  
  const getApplicableHeartZone = computed(() => (date: string, nativeZones: any, configZonesId: number) => {
    const zonesId = configZonesId === -1 ? nativeZones.id : configZonesId;
    return record.value.find(({ id }) => id === zonesId) || nativeZones;
  });
  
  return {
    record,
    fetchHeartZones: makeApiCallback('fetchHeartZones', fetchHeartZonesCb),
    getHeartZones,
    getApplicableHeartZone,
  };
});

export default useHeartZonesStore;
