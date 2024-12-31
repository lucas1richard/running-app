import { useRef } from 'react';

const useRunOnce = <C, D>(cb: C, dep: D) => {
  const didRun = useRef(false);
  
  if (dep && !didRun.current) {
    if (typeof cb === 'function') cb();

    didRun.current = true;

    return true;
  }

  return false;
}

export default useRunOnce;
