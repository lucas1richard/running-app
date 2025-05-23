import requestor from '@/utils/requestor';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useApiCallback } from './apiStatus';

export const usePRStore = defineStore('prs', () => {
  const makeApiCallback = useApiCallback();
  const prs = ref<BestEffort[]>([]);
  const byDate = ref<Record<string, BestEffort[]>>({});

  const fetchPRsCb = async () => {
    const res = await requestor.get('/activities/prs');
    if (res.status === 200) {
      const data = await res.json();
      prs.value = data;
    } else {
      throw new Error(`Failed to fetch PRs: ${res.statusText}`);
    }
  };

  const fetchPRsByDateCb = async () => {
    const res = await requestor.get('/activities/prs/by-date');
    if (res.status === 200) {
      const data = await res.json();
      byDate.value = data;
    } else {
      throw new Error(`Failed to fetch PRs by date: ${res.statusText}`);
    }
  };

  return {
    prs,
    byDate,
    fetchPRs: makeApiCallback('fetchPRs', fetchPRsCb),
    fetchPRsByDate: makeApiCallback('fetchPRsByDate', fetchPRsByDateCb),
  };
});