interface Stats {
  mean: number;
  median: number;
  variance: number;
  standardDeviation: number;
}

/**
 * Calculates mean, median, variance, and standard deviation of an array of numbers.
 * @param data Array of numbers
 * @param isSample If true, calculates Sample Variance (N-1). If false, Population Variance (N).
 */
function calculateStats(data: number[], isSample: boolean = false): Stats {
  const n = data.length;
  if (n < 2) {
    throw new Error("Statistics calculation requires at least two data points.");
  }

  // --- 1. Mean Calculation (O(N)) ---
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += data[i];
  }
  const mean = sum / n;

  // --- 2. Median Calculation (O(N log N)) ---
  // We copy the array to avoid mutating the original input data
  const sorted = [...data].sort((a, b) => a - b);
  let median: number;
  const mid = Math.floor(n / 2);

  if (n % 2 !== 0) {
    // Odd length: take the middle element
    median = sorted[mid];
  } else {
    // Even length: average of the two middle elements
    median = (sorted[mid - 1] + sorted[mid]) / 2;
  }

  // --- 3. Variance & StdDev Calculation (O(N)) ---
  let squareDiffSum = 0;
  for (let i = 0; i < n; i++) {
    const diff = data[i] - mean;
    squareDiffSum += diff * diff;
  }

  const divisor = isSample ? n - 1 : n;
  const variance = squareDiffSum / divisor;

  return {
    mean,
    median,
    variance,
    standardDeviation: Math.sqrt(variance),
  };
}

export default calculateStats;
