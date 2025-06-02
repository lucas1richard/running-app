import { computed } from 'vue';

const getMinMax = (data: [number, number, ...number[]][], startSkip = 2) => {
  // slice(2) to skip the first two elements which are extreme because of the activity start
  return [
    Math.min.apply(null, data.slice(startSkip).map(([_, val]) => val).filter((val) => !isNaN(Number(val)))),
    Math.max.apply(null, data.slice(startSkip).map(([_, val]) => val).filter((val) => !isNaN(Number(val)))),
  ];
};

export default getMinMax;
