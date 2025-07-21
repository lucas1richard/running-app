import { defineStore } from 'pinia';
import { ref } from 'vue';

const useRecentlyVisited = defineStore('recentlyVisited', () => {
  const list = ref<string[]>([]);

  const addRecentlyVisited = (id: string) => {
    const existingIdIx = list.value.indexOf(id);
    if (existingIdIx !== -1) list.value.splice(existingIdIx, 1);
    list.value.unshift(id);
  };

  return {
    list,
    addRecentlyVisited,
  };
});

export default useRecentlyVisited;
