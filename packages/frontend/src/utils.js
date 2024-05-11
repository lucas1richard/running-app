export const getDuration = (s) => {
  const seconds = s % 60;
  const minutes = Math.floor(s / 60);
  const hours = Math.floor(((s / 60) / 60) / 60)

  const display = [seconds, minutes, hours].filter(Boolean);
  const text = ['sec', 'min', 'hr'];
  const real = display.map((val, ix) => [val, text[ix]]);

  return real.reverse();
};

export const condenseZonesFromHeartRate = (zones, heartrate) => {
  const rangeMap = [zones.z1, zones.z2, zones.z3, zones.z4, zones.z5, Number.POSITIVE_INFINITY];

  const zone = rangeMap.findIndex((threshhold, ix) => threshhold <= heartrate[0] && rangeMap[ix + 1] > heartrate[0]) + 1;
  const ans = [{ zone, from: 0, to: 1}];

  heartrate.forEach((hr, ix) => {
    if (ix < 1) return;
    const zone = rangeMap.findIndex((threshhold, ix) => threshhold <= hr && rangeMap[ix + 1] > hr) + 1;
    const latest = ans[ans.length - 1];

    if (zone === latest.zone) {
      latest.to = ix + 1;
    } else {
      ans.push({ zone, from: ix, to: ix + 1 });
    }
  });

  return ans;
};
