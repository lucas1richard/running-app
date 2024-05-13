import React, { useCallback, useMemo } from 'react';
import DurationDisplay from '../Common/DurationDisplay';
import { hrZonesBg } from '../colors/hrZones';
import { convertHeartDataToZoneSpeeds, convertHeartDataToZoneTimes, convertMetricSpeedToMPH } from '../utils';

const HeartZonesDisplay = ({ zones, heartData, velocityData }) => {
  const totalTimes = useMemo(() => {
    return convertHeartDataToZoneTimes(heartData, zones);
  }, [heartData, zones.z1, zones.z2, zones.z3, zones.z4, zones.z5]);
  // const totalTimes = useMemo(() => {
  //   if (!heartData) return [];

  //   const rangeMap = [zones.z1, zones.z2, zones.z3, zones.z4, zones.z5, Number.POSITIVE_INFINITY];

  //   return heartData.reduce((acc, heartrate) => {
  //     const zone = rangeMap.findIndex((threshhold, ix) => threshhold <= heartrate && rangeMap[ix + 1] > heartrate);
  //     const newacc = [...acc];
  //     newacc[zone] = (newacc[zone] || 0) + 1;
  //     return newacc;
  //   }, new Array(5).fill(0));
  // }, [heartData, zones.z1, zones.z2, zones.z3, zones.z4, zones.z5]);

  const percents = useMemo(() => {
    return totalTimes.map((time) => (100 * time / heartData?.length).toFixed(2));
  }, [totalTimes, heartData?.length]);

  const avg = useMemo(() => convertHeartDataToZoneSpeeds(zones, heartData, velocityData), [heartData, velocityData, zones]);

  const Cell = useCallback(({ ix }) => (
    <>
      <div className="flex flex-justify-between">
        <div>
          Time in Zone:
        </div>
        <div>
          <DurationDisplay numSeconds={totalTimes[ix]} /> ({percents[ix]}%)
        </div>
      </div>
      {avg[ix] && (
        <>
        <div className="flex flex-justify-between">
          <div>
            Avg Pace in Zone:
          </div>
          <div>
            <DurationDisplay numSeconds={Math.floor((3660 / convertMetricSpeedToMPH(avg[ix].avg)))} />/mi
          </div>
        </div>
        <div className="flex flex-justify-between">
          <div>
            Fastest Pace in Zone:
          </div>
          <div>
            <DurationDisplay numSeconds={Math.floor((3660 / convertMetricSpeedToMPH(avg[ix].max)))} />/mi
          </div>
        </div>
        </>
      )}
    </>
  ), [avg, percents, totalTimes]);

  return (
    <div style={{ border: '1px solid black' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '20%', padding: '1rem', background: hrZonesBg[1] }}>
          <div className="text-center margin-b">
            <b>Zone 1</b> ({zones.z1} - {zones.z2 - 1})
          </div>
          <Cell ix={0} />
        </div>
        <div style={{ width: '20%', padding: '1rem', background: hrZonesBg[2] }}>
          <div className="text-center margin-b">
            <b>Zone 2</b> ({zones.z2} - {zones.z3 - 1})
          </div>
          <Cell ix={1} />
        </div>
        <div style={{ width: '20%', padding: '1rem', background: hrZonesBg[3] }}>
          <div className="text-center margin-b">
            <b>Zone 3</b> ({zones.z3} - {zones.z4 - 1})
          </div>
          <Cell ix={2} />
        </div>
        <div style={{ width: '20%', padding: '1rem', background: hrZonesBg[4] }}>
          <div className="text-center margin-b">
            <b>Zone 4</b> ({zones.z4} - {zones.z5 - 1})
          </div>
          <Cell ix={3} />
        </div>
        <div style={{ width: '20%', padding: '1rem', background: hrZonesBg[5] }}>
          <div className="text-center margin-b">
            <b>Zone 5</b> (>={zones.z5})
          </div>
          <Cell ix={4} />
        </div>
      </div>
    </div>
  );
};

export default HeartZonesDisplay;
