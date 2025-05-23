import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export type APIStatusType = 'loading' | 'success' | 'error' | 'idle';

export const useApiStatusStore = defineStore('apiStatus', () => {
  const apiStatus = reactive<Record<string, APIStatusType>>({});

  function getApiStatus(key: string): APIStatusType {
    return apiStatus[key] || 'idle';
  }

  function makeApiCallback(
    key: string,
    cb: (...args: any[]) => any
  ): (...args: any[]) => Promise<void> {
    return async (...args: any[]) => {
      apiStatus[key] = 'loading';
      try {
        await cb(...args);
        apiStatus[key] = 'success';
      } catch (error) {
        apiStatus[key] = 'error';
        throw error; // Re-throw the error for further handling if needed
      }
    };
  }

  return {
    apiStatus,
    getApiStatus,
    makeApiCallback,
  };
});

export const useApiCallback = () => useApiStatusStore().makeApiCallback;
