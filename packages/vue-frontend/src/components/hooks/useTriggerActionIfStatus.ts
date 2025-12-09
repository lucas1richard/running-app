import { useApiStatusStore, type APIStatusType } from '@/stores/apiStatus';
import { ref, watch, type ComputedRef } from 'vue';

export const useTriggerActionIfStatus = (
  key: ComputedRef<string>,
  cb: ComputedRef<(...args: any[]) => any>,
  status: APIStatusType = 'idle',
  options: { defer?: boolean } = { defer: false }
) => {
  const apiStatusStore = useApiStatusStore();
  const apiStatus = ref(apiStatusStore.getApiStatus(key.value));

  watch(key, (newKey) => {
    apiStatus.value = apiStatusStore.getApiStatus(newKey);
    if (apiStatus.value === status && !options.defer) cb.value();
  }, { immediate: true });

  return apiStatus;
};
