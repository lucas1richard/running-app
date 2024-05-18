import React, { useCallback, useMemo } from 'react';
import DurationDisplay from '../Common/DurationDisplay';
import { hrZonesBg, hrZonesBgStrong, hrZonesText } from '../colors/hrZones';
import { convertHeartDataToZoneSpeeds, convertHeartDataToZoneTimes, convertMetricSpeedToMPH } from '../utils';

const HeartZonesDisplay = ({ zones, nativeZones, heartData, velocityData }) => {
  const totalTimes = useMemo(() => {
    return convertHeartDataToZoneTimes(heartData, zones);
  }, [heartData, zones.z1, zones.z2, zones.z3, zones.z4, zones.z5]);

  const percents = useMemo(() => {
    return totalTimes.map((time) => (100 * time / heartData?.length).toFixed(2));
  }, [totalTimes, heartData?.length]);

  const avg = useMemo(() => convertHeartDataToZoneSpeeds(zones, heartData, velocityData), [heartData, velocityData, zones]);

  const isUsingNonNativeZones = nativeZones.id !== zones.id;

  const Cell = useCallback(({ ix, title, range }) => {
    const isMaxPercentage = Number(percents[ix]) === Math.max.apply(null, percents.map(Number));
    return (
      <div
        className="flex-item-grow"
        style={{
          padding: '1rem',
          background: hrZonesBg[ix + 1],
          border: `1px solid ${isMaxPercentage ? hrZonesBgStrong[ix+1] : hrZonesBg[ix + 1]}`,
          ...isMaxPercentage ? { boxShadow: `inset 0 0 1rem ${hrZonesText[ix+1]}` } : {},
        }}
      >
        <div className="text-center margin-b">
          <b>{title}</b> ({range})
        </div>
          <div className="flex flex-justify-between">
            <div>
              Time in Zone:
            </div>
            <div>
              <DurationDisplay numSeconds={totalTimes[ix]} /> <span>({percents[ix]}%)</span>
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
      </div>
    );
  }, [avg, percents, totalTimes]);

  return (
    <div>
      {isUsingNonNativeZones && (
        <div>
          Note: Using Non-native Heart Rate Zones
        </div>
      )}
      <div style={{ border: '1px solid black' }}>
        <div className="flex">
          <Cell ix={0} title="Zone 1" range={`${zones.z1} - ${zones.z2 - 1}`} />
          <Cell ix={1} title="Zone 2" range={`${zones.z2} - ${zones.z3 - 1}`} />
          <Cell ix={2} title="Zone 3" range={`${zones.z3} - ${zones.z4 - 1}`} />
          <Cell ix={3} title="Zone 4" range={`${zones.z4} - ${zones.z5 - 1}`} />
          <Cell ix={4} title="Zone 5" range={<span>&ge; {zones.z5}</span>} />
        </div>
      </div>
    </div>
  );
};

export default HeartZonesDisplay;
