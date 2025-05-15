import requestor from '@/utils/requestor';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePRStore = defineStore('prs', () => {
  const prs = ref<BestEffort[]>([]);
  const byDate = ref<Record<string, BestEffort[]>>({});

  function setPRsAction(payload: BestEffort[]) {
    prs.value = payload;
  }

  function setPRsByDateAction(payload: Record<string, BestEffort[]>) {
    byDate.value = payload;
  }

  async function fetchPRs() {
    const res = await requestor.get('/activities/prs');
    if (res.status === 200) {
      const data = await res.json();
      setPRsAction(data);
    }
  }

  async function fetchPRsByDate() {
    const res = await requestor.get('/activities/prs/by-date');
    if (res.status === 200) {
      const data = await res.json();
      setPRsByDateAction(data);
    }
  }

  return {
    prs,
    byDate,
    fetchPRs,
    fetchPRsByDate,
    setPRsAction,
    setPRsByDateAction,
  };
});