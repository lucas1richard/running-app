type HRPoint = {
  time: number;       // seconds since walking started
  heartRate: number;  // bpm
};

function calculateRecoveryTau(
  points: HRPoint[],
  hr0: number,
  hrInf: number
): number {
  const transformed = points
    .map(p => {
      const numerator = p.heartRate - hrInf;
      const denominator = hr0 - hrInf;

      if (numerator <= 0 || denominator <= 0) {
        return null;
      }

      return {
        t: p.time,
        y: Math.log(numerator / denominator)
      };
    })
    .filter(
      (p): p is { t: number; y: number; } =>
        p !== null
    );

  if (transformed.length < 2) {
    throw new Error("Not enough valid HR points");
  }

  // Ordinary least-squares linear regression:
  // y = slope * t + intercept

  const n = transformed.length;

  const sumT = transformed.reduce(
    (sum, p) => sum + p.t,
    0
  );

  const sumY = transformed.reduce(
    (sum, p) => sum + p.y,
    0
  );

  const sumT2 = transformed.reduce(
    (sum, p) => sum + p.t * p.t,
    0
  );

  const sumTY = transformed.reduce(
    (sum, p) => sum + p.t * p.y,
    0
  );

  const slope =
    (n * sumTY - sumT * sumY) /
    (n * sumT2 - sumT * sumT);

  // if (slope >= 0) {
  //   throw new Error(
  //     "HR is not recovering exponentially"
  //   );
  // }

  return -1 / slope;
}

export default calculateRecoveryTau;

const recoveryPoints = [
  { time: 0, heartRate: 170 },
  { time: 10, heartRate: 165 },
  { time: 20, heartRate: 161 },
  { time: 30, heartRate: 157 },
  { time: 40, heartRate: 154 },
  { time: 50, heartRate: 151 },
  { time: 60, heartRate: 149 },
  { time: 90, heartRate: 145 },
  { time: 120, heartRate: 142 }
];

const tau = calculateRecoveryTau(
  recoveryPoints,
  170, // HR when walking starts
  130  // estimated eventual recovery HR
);

console.log(`Recovery τ = ${tau.toFixed(1)} seconds`);
