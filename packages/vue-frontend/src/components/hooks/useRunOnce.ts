import { ref } from 'vue';

const useRunOnce = <C, D>(cb: C, dep: D) => {
  const didRun = ref(false);
  
  if (dep && !didRun.value) {
    if (typeof cb === 'function') cb();

    didRun.value = true;

    return true;
  }

  return false;
}

export default useRunOnce;
