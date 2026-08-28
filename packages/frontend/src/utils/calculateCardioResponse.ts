export type RunningPoint = {
  time: number;           // seconds since start of run interval
  heartRate: number;      // bpm
  velocityMPerMin: number; // meters per minute
  gradePercent: number;   // e.g. 2 = 2%
};

export type CardioResponse = {
  averageWorkload: number; // estimated VO₂, ml/kg/min
  hrRise30s: number;       // bpm
  hrRise60s: number;       // bpm
  hrAuc60s: number;        // bpm * seconds
  efficiency: number;      // workload / HR elevation
};

/**
 * Numerically integrates sampled data using the trapezoidal rule.
 */
function integrate(points: { time: number; value: number; }[]): number {
  let area = 0;

  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];

    const dt = b.time - a.time;

    area += ((a.value + b.value) / 2) * dt;
  }

  return area;
}

/**
 * Estimates running oxygen consumption using the ACSM running equation.
 *
 * velocityMPerMin: meters/minute
 * gradePercent: grade as a percentage, e.g. 5 = 5%
 *
 * Returns estimated VO₂ in ml/kg/min.
 */
function runningVO2(
  velocityMPerMin: number,
  gradePercent: number
): number {
  const grade = gradePercent / 100;

  return (
    0.2 * velocityMPerMin +
    0.9 * velocityMPerMin * grade +
    3.5
  );
}

/**
 * Calculates cardiovascular response during a running interval.
 *
 * The first 60 seconds are used because we're interested in
 * how quickly HR responds to the transition into running.
 */
function calculateCardioResponse(
  points: RunningPoint[]
): CardioResponse {
  if (points.length < 2) {
    throw new Error("At least 2 points are required");
  }

  const hr0 = points[0].heartRate;

  // Only analyze the first 60 seconds.
  const interval = points.filter(p => p.time <= 60);

  if (interval.length < 2) {
    throw new Error("Need at least 2 points within the first 60 seconds");
  }

  // -----------------------------
  // Heart-rate response
  // -----------------------------

  const hrCurve = interval.map(p => ({
    time: p.time,
    value: p.heartRate - hr0
  }));

  const hrAuc = integrate(hrCurve);

  // -----------------------------
  // Workload
  // -----------------------------

  const workloadCurve = interval.map(p => ({
    time: p.time,
    value: runningVO2(
      p.velocityMPerMin,
      p.gradePercent
    )
  }));

  const workloadAuc = integrate(workloadCurve);

  const duration =
    interval[interval.length - 1].time - interval[0].time;

  const averageWorkload =
    workloadAuc / duration;

  const averageHRRise =
    hrAuc / duration;

  // -----------------------------
  // Simple HR lag measurements
  // -----------------------------

  const hrAt = (time: number): number => {
    if (time <= interval[0].time) {
      return interval[0].heartRate;
    }

    for (let i = 1; i < interval.length; i++) {
      const a = interval[i - 1];
      const b = interval[i];

      if (time <= b.time) {
        const fraction =
          (time - a.time) /
          (b.time - a.time);

        return (
          a.heartRate +
          fraction * (b.heartRate - a.heartRate)
        );
      }
    }

    return interval[interval.length - 1].heartRate;
  };

  const hrRise30s =
    hrAt(30) - hr0;

  const hrRise60s =
    hrAt(60) - hr0;

  // -----------------------------
  // Final metric
  // -----------------------------

  const efficiency =
    averageWorkload / averageHRRise;

  return {
    averageWorkload,
    hrRise30s,
    hrRise60s,
    hrAuc60s: hrAuc,
    efficiency
  };
}

export default calculateCardioResponse;

const result = calculateCardioResponse([
  {
    time: 0,
    heartRate: 145,
    velocityMPerMin: 160.9,
    gradePercent: 0
  },
  {
    time: 10,
    heartRate: 147,
    velocityMPerMin: 161.5,
    gradePercent: 0
  },
  {
    time: 20,
    heartRate: 151,
    velocityMPerMin: 162.0,
    gradePercent: 1
  },
  {
    time: 30,
    heartRate: 154,
    velocityMPerMin: 163.0,
    gradePercent: 1
  },
  {
    time: 40,
    heartRate: 157,
    velocityMPerMin: 163.5,
    gradePercent: 1
  },
  {
    time: 50,
    heartRate: 159,
    velocityMPerMin: 164.0,
    gradePercent: 0
  },
  {
    time: 60,
    heartRate: 161,
    velocityMPerMin: 164.0,
    gradePercent: 0
  }
]);

console.log(result);