import { useApiStatusStore, type APIStatusType } from '@/stores/apiStatus';
import { ref, watch } from 'vue';

export const useTriggerActionIfStatus = (
  key: string,
  cb: (...args: any[]) => any,
  status: APIStatusType = 'idle',
  options: { defer?: boolean } = { defer: false }
) => {
  const apiStatusStore = useApiStatusStore();
  const apiStatus = ref(apiStatusStore.getApiStatus(key));

  watch(() => key, (newKey, oldKey) => {
    console.log({newKey, oldKey});
    apiStatus.value = apiStatusStore.getApiStatus(newKey);
    if (apiStatus.value === status && !options.defer) cb();
  }, { immediate: true });

  return apiStatus;
};
