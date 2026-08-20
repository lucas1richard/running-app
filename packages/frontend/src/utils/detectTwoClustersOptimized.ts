function detectTwoClustersOptimized(data: number[]): { centroids: number[], assignments: number[]; } {
  const n = data.length;
  if (n < 2) throw new Error("At least two numbers are required.");

  // --- 1. Outlier Removal using IQR ---
  const sorted = [...data].sort((a, b) => a - b);
  const lowerBound = sorted[Math.floor(n * 0.05)];
  const upperBound = sorted[Math.floor(n * 0.95)];
  const cleanedData = data.filter(v => v >= lowerBound && v <= upperBound);
  // Fallback: if IQR removes too much data, use original
  const trainingData = cleanedData.length >= 2 ? cleanedData : data;
  // --- 2. Centroid Calculation (K-Means) ---
  let min = trainingData[0], max = trainingData[0];
  for (let i = 1; i < trainingData.length; i++) {
    if (trainingData[i] < min) min = trainingData[i];
    if (trainingData[i] > max) max = trainingData[i];
  }

  let c0 = min;
  let c1 = max;

  const maxIterations = 100;
  for (let iter = 0; iter < maxIterations; iter++) {
    let sum0 = 0, count0 = 0;
    let sum1 = 0, count1 = 0;

    for (let i = 0; i < n; i++) {
      const val = data[i];
      if (Math.abs(val - c0) < Math.abs(val - c1)) {
        sum0 += val;
        count0++;
      } else {
        sum1 += val;
        count1++;
      }
    }

    const nextC0 = count0 === 0 ? c0 : sum0 / count0;
    const nextC1 = count1 === 0 ? c1 : sum1 / count1;

    if (nextC0 === c0 && nextC1 === c1) break;

    c0 = nextC0;
    c1 = nextC1;
  }

  // Final pass to get assignments
  const assignments = new Array(n);
  for (let i = 0; i < n; i++) {
    assignments[i] = Math.abs(data[i] - c0) < Math.abs(data[i] - c1) ? 0 : 1;
  }

  return {
    centroids: [c0, c1],
    assignments: assignments,
  };
}

export default detectTwoClustersOptimized;
