import { useMemo } from 'react';

const useCalculatedGrade = (riseStream: number[], distanceStream: number[], windowSize = 1) => {
  // intervals.icu does not provide a grade stream
  const syntheticGradeStream = useMemo(() => {
    if (!riseStream.length || !distanceStream.length) return [];

    const as = riseStream;
    const ds = distanceStream;
    const grades = new Array(as.length).fill(0);

    for (let i = windowSize; i < Math.min(as.length, ds.length); i++) {
      const deltaAlt = as[i] - as[i - windowSize];
      const deltaDist = ds[i] - ds[i - windowSize];

      if (deltaDist > 0) {
        grades[i] = (deltaAlt / deltaDist) * 100;
      } else {
        // Fallback to previous value or 0 if stopped
        grades[i] = grades[i - 1] || 0;
      }
    }
    return grades;
  }, [riseStream, distanceStream]);

  return syntheticGradeStream;
};

export default useCalculatedGrade;
