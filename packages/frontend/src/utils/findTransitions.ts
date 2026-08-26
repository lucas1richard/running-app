type Sample = {
  time: number;  // seconds from start
  value: number; // speed, HR, power, etc.
};

type Transition = {
  time: number;
  from: number;
  to: number;
  magnitude: number;
};

function detectTransitions(
  samples: Sample[],
  windowSeconds: number,
  minChange: number
): Transition[] {
  const transitions: Transition[] = [];

  for (let i = 0; i < samples.length; i++) {
    const t = samples[i].time;

    const before = samples.filter(s => s.time >= t - windowSeconds && s.time < t);
    const after = samples.filter(s => s.time > t && s.time <= t + windowSeconds);

    if (before.length === 0 || after.length === 0) {
      continue;
    }

    const beforeMean = before.reduce((sum, s) => sum + s.value, 0) / before.length;
    const afterMean = after.reduce((sum, s) => sum + s.value, 0) / after.length;

    const magnitude =
      Math.abs(afterMean - beforeMean);

    if (magnitude >= minChange) {
      transitions.push({
        time: t,
        from: beforeMean,
        to: afterMean,
        magnitude,
      });
    }
  }

  console.log(transitions);

  return mergeNearbyTransitions(transitions, windowSeconds);
}

function mergeNearbyTransitions(
  transitions: Transition[],
  minimumSeparation: number
): Transition[] {
  if (transitions.length === 0) return [];

  const result: Transition[] = [];

  let group = [transitions[0]];

  for (let i = 1; i < transitions.length; i++) {
    const current = transitions[i];
    const previous = group[group.length - 1];

    if (current.time - previous.time <= minimumSeparation) {
      group.push(current);
    } else {
      result.push(strongest(group));
      group = [current];
    }
  }

  result.push(strongest(group));

  return result;
}

function strongest(
  transitions: Transition[]
): Transition {
  return transitions.reduce((best, current) =>
    current.magnitude > best.magnitude
      ? current
      : best
  );
}

export default detectTransitions;
