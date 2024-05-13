import React, { useMemo } from 'react';
import { convertHeartDataToZonePercents } from '../utils';
import { hrZonesBg, hrZonesBgStrong, hrZonesText } from '../colors/hrZones';

const ZonesWidth = ({ zones, heartData }) => {
  const times = useMemo(() => convertHeartDataToZonePercents(heartData, zones), [heartData, zones]);
  if (!zones || !heartData) return null;
  
  return (
    <div style={{ display: 'flex' }}>
      {times.filter((n) => Boolean(Number(n))).map((time, ix) => (
        <div
          style={{
            width: `${time}%`,
            background: hrZonesText[ix + 1],
            border: `1px solid ${hrZonesText[ix + 1]}`,
            height: '0.5rem',
            overflow: 'hidden',
          }}
        />
      ))}
    </div>
  );
};

export default ZonesWidth;
