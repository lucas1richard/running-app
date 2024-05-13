import gradientScale from './colors/gradient-scale';

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

  const zone = rangeMap.findIndex((zoneLowThreshhold, ix) => zoneLowThreshhold <= heartrate[0] && rangeMap[ix + 1] > heartrate[0]) + 1;
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

// numIxAvailable referring to the length of a constant array of X (for ex: number gradient colors)
export const getPercentileToIx = (numIxAvailable, data, refIx) => {
  // where among the original data does refVal rank?

  // but we care about what's normal, don't we? otherwise is it useful under normal human consciousness?
  // basically what's mentally ergonomic
  // then we should have an absolute scale: as in that we know the boundaries.
  // 0 to 100, it's irrefutable
  // maybe not. what about -100 to 100?

  return Math.floor(numIxAvailable * (data[refIx] / 100));
};

export const condenseGradeColorToPlot = (colors) => {
  const ans = [{
    color: colors[0],
    from: 0,
    to: 1,
  }];

  colors.forEach((color, ix) => {
    if (ix < 1) return;
    const latest = ans[ans.length - 1];

    if (color === latest.color) {
      latest.to = ix + 1;
    } else {
      ans.push({ color, from: latest.to - 1, to: ix + 1 });
    }
  });

  return ans;
};

export const getGradeColor = (dataArr, { relativeMode, vertex = 10 } = {}) => {
  console.log(dataArr);
  // high, min, percentile diff
  const high = Math.max.apply(null, dataArr);
  const low = relativeMode ? Math.min.apply(null, dataArr) : -1 * vertex;
  const vert = Math.max(Math.abs(low), Math.abs(high));
  const adjustedHigh = relativeMode ? vert : vertex;

  const maxIx = gradientScale.length - 1;
  
  const percentiles = dataArr.map((el) => (el - low) / (adjustedHigh - low));
  const colorsIx = percentiles.map((p) => Math.floor(p * maxIx));
  const colors = colorsIx.map((ix) => gradientScale[ix]);

  // console.log(
  //   dataArr.map((grade, ix) => ({
  //     grade,
  //     percentile: percentiles[ix],
  //     colorIx: colorsIx[ix],
  //   })
  // ));

  return condenseGradeColorToPlot(colors);
};
