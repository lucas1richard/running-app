import { useMemo } from 'react';

const useMinMax = (data: [unknown, unknown][], startSkip = 2) => {
  // slice(2) to skip the first two elements which are extreme because of the activity start
  return useMemo(() => [
    Math.min.apply(null, data.slice(startSkip).map(([_, val]) => val).filter((val) => !isNaN(Number(val)))),
    Math.max.apply(null, data.slice(startSkip).map(([_, val]) => val).filter((val) => !isNaN(Number(val)))),
  ], [data, startSkip]);
};

export default useMinMax;
