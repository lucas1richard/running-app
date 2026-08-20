interface ClusterMetrics {
  minClusterAvg: number;
  maxClusterAvg: number;
  mean: number;
  median: number;
  standardDeviation: number;
  assignments: number[];
}

interface ClusteringResult {
  isMeaningful: boolean;
  isRegular: boolean;
  confidence: 'none' | 'low' | 'medium' | 'high';
  separationRatio: number;
  regularityScore: number;
}

/**
 * Analyzes the regularity of transitions between clusters to detect 
 * structured intervals.
 */
function analyzeRegularity(assignments: number[]): { isRegular: boolean, score: number; } {
  const transitions: number[] = [];
  let lastCluster = assignments[0];
  let lastTransitionIndex = 0;

  for (let i = 1; i < assignments.length; i++) {
    if (assignments[i] !== lastCluster) {
      transitions.push(i - lastTransitionIndex);
      lastCluster = assignments[i];
      lastTransitionIndex = i;
    }
  }

  if (transitions.length < 3) {
    return { isRegular: false, score: 0 };
  }

  const mean = transitions.reduce((a, b) => a + b, 0) / transitions.length;
  const variance = transitions.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / transitions.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of Variation (CV)
  // CV < 0.1 indicates high regularity (low variance relative to mean)
  const cv = stdDev / mean;

  return {
    isRegular: cv < 0.1,
    score: 1 - cv,
  };
}

/**
 * Determines if clustering is meaningfully occurring based on the 
 * distance between centroids relative to the global standard deviation.
 */
function analyzeClustering(metrics: ClusterMetrics): ClusteringResult {
  const { minClusterAvg, maxClusterAvg, standardDeviation, assignments } = metrics;

  const centroidDistance = Math.abs(maxClusterAvg - minClusterAvg);

  if (standardDeviation === 0) {
    return { isMeaningful: false, isRegular: false, confidence: 'none', separationRatio: 0, regularityScore: 0 };
  }

  const separationRatio = centroidDistance / standardDeviation;
  const regularity = analyzeRegularity(assignments);

  let confidence: ClusteringResult['confidence'] = 'none';
  let isMeaningful = false;

  if (separationRatio >= 3.0) {
    isMeaningful = true;
    confidence = 'high';
  } else if (separationRatio >= 2) {
    isMeaningful = true;
    confidence = 'medium';
  } else if (separationRatio >= 1) {
    isMeaningful = false;
    confidence = 'low';
  }

  return {
    isMeaningful,
    isRegular: regularity.isRegular,
    confidence,
    separationRatio,
    regularityScore: regularity.score,
  };
}

export default analyzeClustering;
