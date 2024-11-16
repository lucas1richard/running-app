const getSmoothVal = (timeSeries: any[], valSeries: number[], factor = 20) => {
  const smoothVal = [];
  for (let i = 0; i < timeSeries.length; i++) {
    const val = valSeries[i];
    if (i <= factor - 2) {
      smoothVal.push(val);
    } else if (i === factor - 1) {
      let prevVal = 0;
      for (let j = 1; j <= factor - 1; j++) {
        prevVal += valSeries[i - j];
      }
      const newVal = (prevVal + val) / (factor || 1);
      smoothVal.push(newVal);
    } else {
      const prevVal = smoothVal[i - 1] * factor - valSeries[i - factor] + val;
      const newVal = prevVal / (factor || 1);
      smoothVal.push(newVal);
    }
  }
  return smoothVal;
};

export default getSmoothVal;
