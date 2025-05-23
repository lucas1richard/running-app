import { useApiStatusStore, type APIStatusType } from '@/stores/apiStatus';

export const useTriggerActionIfStatus = (
  key: string,
  cb: (...args: any[]) => any,
  status: APIStatusType = 'idle',
  options: { defer?: boolean } = { defer: false }
) => {
  const apiStatusStore = useApiStatusStore();
  const apiStatus = apiStatusStore.getApiStatus(key);
  if (apiStatus === status && !options.defer) cb();

  return apiStatus;
};
