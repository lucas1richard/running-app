const METERS_PER_MILE = 1609.34;
const FEET_PER_METER = 3.28084;

const convertMetersToMiles = (distance) => Math.round((distance / METERS_PER_MILE) * 100) / 100;

const convertMetersToFt = (distance) => Math.round(distance * FEET_PER_METER);

const convertMetricSpeedToMPH = (metersPerSecond) => metersPerSecond * 2.237;

const getSecondsPerMile = (metersPerSecond) => {
  const milesPerSecond = metersPerSecond / METERS_PER_MILE;
  const secondsPerMile = 1 / milesPerSecond;
  return Math.round(secondsPerMile);
};

module.exports = {
  convertMetersToMiles,
  convertMetersToFt,
  convertMetricSpeedToMPH,
  getSecondsPerMile,
};
