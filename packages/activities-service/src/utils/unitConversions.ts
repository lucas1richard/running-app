const METERS_PER_MILE = 1609.34;
const FEET_PER_METER = 3.28084;

const convertMetersToMiles = (distance: number) => Math.round((distance / METERS_PER_MILE) * 100) / 100;

const convertMetersToFt = (distance: number) => Math.round(distance * FEET_PER_METER);

const convertMetricSpeedToMPH = (metersPerSecond: number) => metersPerSecond * 2.237;

const getSecondsPerMile = (metersPerSecond: number) => {
  const milesPerSecond = metersPerSecond / METERS_PER_MILE;
  const secondsPerMile = 1 / milesPerSecond;
  return Math.round(secondsPerMile);
};

export {
  convertMetersToMiles,
  convertMetersToFt,
  convertMetricSpeedToMPH,
  getSecondsPerMile,
};
