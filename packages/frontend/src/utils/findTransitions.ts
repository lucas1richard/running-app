type Sample = {
  time: number;  // seconds from start
  value: number; // speed, HR, power, etc.
  start_index?: number;
  end_index?: number;
};

export type Transition = {
  time: number;
  from: number;
  start_index: number;
  end_index?: number;
  to: number;
  magnitude: number;
  value: number;
};

function detectTransitions(
  samples: Sample[],
  windowSeconds: number,
  minChange: number
): (Required<Transition>)[] {
  const transitions: Transition[] = getTransitions(samples, windowSeconds, minChange);
  const groups = groupTransitions(transitions, windowSeconds);

  const narrowTransitions = groups.map((s) => getTransitions(s, windowSeconds / 2, minChange));

  return narrowTransitions.map((n, ix) => ({
    ...n[0],
    end_index: (narrowTransitions[ix + 1]?.[0]?.start_index ?? samples.length) - 1
  }));
}

function getTransitions(samples: Sample[], windowSeconds: number, minChange: number) {
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
        start_index: samples[i].start_index ?? i,
        from: beforeMean,
        to: afterMean,
        magnitude,
        value: samples[i].value,
      });
    }
  }

  return transitions;
}

function groupTransitions(
  transitions: Transition[],
  minimumSeparation: number
): Transition[][] {
  if (transitions.length === 0) return [];

  const result: Transition[][] = [];

  let group = [transitions[0]];

  for (let i = 1; i < transitions.length; i++) {
    const current = transitions[i];
    const previous = group[group.length - 1];

    if (current.time - previous.time <= minimumSeparation) {
      group.push(current);
    } else {
      result.push(group);
      group = [current];
    }
  }

  result.push(group);

  return result;
}

export default detectTransitions;
