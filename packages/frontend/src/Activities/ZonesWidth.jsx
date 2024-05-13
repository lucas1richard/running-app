import React, { useMemo } from 'react';
import { convertHeartDataToZonePercents } from '../utils';
import { hrZonesBg, hrZonesBgStrong } from '../colors/hrZones';

const ZonesWidth = ({ zones, heartData }) => {
  const times = useMemo(() => convertHeartDataToZonePercents(heartData, zones), [heartData, zones]);
  if (!zones || !heartData) return null;
  
  return (
    <div style={{ display: 'flex' }}>
      {times.filter((n) => Boolean(Number(n))).map((time, ix) => (
        <div
          style={{
            width: `${time}%`,
            background: hrZonesBg[ix + 1],
            border: `1px solid ${hrZonesBgStrong[ix + 1]}`,
            height: '0.5rem',
            overflow: 'hidden',
          }}
        />
      ))}
    </div>
  );
};

export default ZonesWidth;
