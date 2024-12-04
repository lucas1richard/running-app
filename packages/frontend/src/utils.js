import dayjs from 'dayjs';
import { createSelectorCreator, weakMapMemoize } from 'reselect';
import fastDeepEqual from 'fast-deep-equal';
import gradientScale from './colors/gradient-scale';

/**
 * @param {number} s number of seconds
 * @param {[seconds: string, minutes: string, hours: string]} text the text to display for each unit
 */
export const getDuration = (s, text = [' sec ', ' min ', ' hr ']) => {
  if (s === Infinity || !s) {
    return [];
  }
  const seconds = s % 60;
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor(s / 60) % 60;

  const display = [seconds, minutes, hours];

  const real = display.map((val, ix) => [val, text[ix]]);

  return real.reverse().slice(real.findIndex(([val]) => !!val));
};

/**
 * @param {number} s number of seconds
 * @param {[seconds: string, minutes: string, hours: string]} text the text to display for each unit
 * @param {string} joinOn the string to join the units on
 */
export const getDurationString = (s, text, joinOn = ' ') => {
  const durationArr = getDuration(s, text);
  return durationArr.map(([num, str]) => `${num}${str}`).join(joinOn);
};

export const condenseZonesFromHeartRate = (zones, heartrate) => {
  const rangeMap = [zones.z1, zones.z2, zones.z3, zones.z4, zones.z5, Number.POSITIVE_INFINITY];

  const zone = rangeMap.findIndex(
    (zoneLowThreshhold, ix) => zoneLowThreshhold <= heartrate[0] && rangeMap[ix + 1] > heartrate[0]
  ) + 1;
  const ans = [{ zone, from: 0, to: 1 }];

  heartrate.forEach((hr, ix) => {
    if (ix < 1) return;
    const zone = rangeMap.findIndex(
      (threshhold, ix) => threshhold <= hr && rangeMap[ix + 1] > hr
    ) + 1;
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
  // high, min, percentile diff
  const high = Math.max.apply(null, dataArr);
  const low = relativeMode ? Math.min.apply(null, dataArr) : -1 * vertex;
  const vert = Math.max(Math.abs(low), Math.abs(high));
  const adjustedHigh = relativeMode ? vert : vertex;

  const maxIx = gradientScale.length - 1;

  const percentiles = dataArr.map((el) => (el - low) / (adjustedHigh - low));
  const colorsIx = percentiles.map((p) => Math.floor(p * maxIx));
  const colors = colorsIx.map((ix) => gradientScale[ix]);

  return condenseGradeColorToPlot(colors);
};

export const convertHeartDataToZoneTimes = (heartData, zones) => {
  if (!heartData) return [];
  const rangeMap = [zones.z1, zones.z2, zones.z3, zones.z4, zones.z5, Number.POSITIVE_INFINITY];

  return heartData.reduce((acc, heartrate) => {
    const zone = rangeMap.findIndex((threshhold, ix) => threshhold <= heartrate && rangeMap[ix + 1] > heartrate);
    const newacc = [...acc];
    newacc[zone] = (newacc[zone] || 0) + 1;
    return newacc;
  }, new Array(5).fill(0));
};
export const convertHeartDataToZoneSpeeds = (zones, heartData, velocityData) => {
  if (!heartData || !velocityData) return [];
  const rangeMap = [zones.z1, zones.z2, zones.z3, zones.z4, zones.z5, Number.POSITIVE_INFINITY];

  const zoneSpeeds = heartData.reduce((acc, heartrate, index) => {
    const zone = rangeMap.findIndex((threshhold, ix) => threshhold <= heartrate && rangeMap[ix + 1] > heartrate);
    const newacc = [...acc];
    newacc[zone] = (newacc[zone] || { zone: zone + 1, mps: 0, count: 0 });
    newacc[zone].mps += velocityData[index];
    newacc[zone].count += 1;
    newacc[zone].max = Math.max(newacc[zone].max, velocityData[index]);
    newacc[zone].min = Math.min(newacc[zone].min, velocityData[index]);
    return newacc;
  }, new Array(5).fill(0).map((el, ix) => ({ zone: ix + 1, mps: 0, count: 0, max: 0, min: Infinity, })));

  return zoneSpeeds.map(({ mps, count, ...rest }) => {
    return {
      avg: count ? mps / count : 0,
      ...rest,
    }
  });
};

export const convertHeartDataToZonePercents = (heartData, zones) => convertHeartDataToZoneTimes(
  heartData,
  zones
).map((time) => (100 * time / heartData?.length).toFixed(2));

export const convertZonesCacheToPercents = (caches) => {
  const arr = [
    caches.seconds_z1,
    caches.seconds_z2,
    caches.seconds_z3,
    caches.seconds_z4,
    caches.seconds_z5,
  ];
  const total = arr.reduce((accum, num) => accum + num, 0);

  return arr.map((time) => (100 * time / total).toFixed(2))
};

export const convertMetersToMiles = (distance) => Math.round((distance * 0.000621371) * 100) / 100;
export const convertMetersToFt = (distance) => Math.round(distance * 3.28084);
export const convertMetricSpeedToMPH = (metersPerSecond) => metersPerSecond * 2.237;
export const getSecondsPerMile = (metersPerSecond) => {
  const milesPerSecond = metersPerSecond * 0.0006213712;
  const secondsPerMile = 1 / milesPerSecond;
  return Math.round(secondsPerMile);
};

export const longestCommonSubString = (x, y, { getXVal = (val) => val, getYVal = (val) => val } = {}) => {
  const m = x.length;
  const n = y.length;
  const cache = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

  const matchingSegments = [];

  let result = 0;
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0 || j === 0)
        cache[i][j] = 0;
      else if (getXVal(x[i - 1]) === getYVal(y[j - 1])) {
        cache[i][j] = cache[i - 1][j - 1] + 1;
        result = Math.max(result, cache[i][j]);
        matchingSegments.push(i - 1)
      } else
        cache[i][j] = 0;
    }
  }
  return matchingSegments;
}

export const getDateString = (date) => dayjs(date).format('MMMM DD, YYYY');
export const getActivityStartDate = (activity) => getDateString(activity.start_date_local);

export const getSummaryPolyline = (activity) => activity?.summary_polyline || activity?.map?.summary_polyline;

export const createDeepEqualSelector = createSelectorCreator(
  weakMapMemoize,
  fastDeepEqual
);

/**
 * @param {number} speed 
 * @returns seconds per mile
 */
export const convertSpeedToPace = (speed) => {
  return Math.floor((3660 / convertMetricSpeedToMPH(speed)));
};

export const getWeatherStyles = (weather) => {
  let backgroundColor;
  switch (weather?.sky) {
    case 'sunny':
      backgroundColor = 'dls-sunshine-bg';
      break;
    case 'overcast':
      backgroundColor = 'dls-overcast-bg';
      break;
    case 'mostly cloudy':
      backgroundColor = 'dls-mostly-cloudy-bg';
      break;
    case 'partly cloudy':
      backgroundColor = 'dls-partly-cloudy-bg';
      break;
    default:
      backgroundColor = 'dls-white-bg';
  }

  return {
    backgroundColor,
  }
};