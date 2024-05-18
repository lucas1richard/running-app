import React, { useMemo } from 'react';
import { convertHeartDataToZonePercents, convertZonesCacheToPercents } from '../utils';
import { hrZonesText } from '../colors/hrZones';

const ZonesWidth = ({ zones, heartData, id, zonesCache }) => {
  const percents = useMemo(() => {
    if (zonesCache) return convertZonesCacheToPercents(zonesCache);
    return convertHeartDataToZonePercents(heartData, zones)
  }, [heartData, zones, zonesCache]);

  if (!zonesCache && !zones && !heartData) return null;
  
  return (
    <div style={{ display: 'flex' }}>
      {percents.filter((n) => Boolean(Number(n))).map((percent, ix) => (
        <div
          style={{
            width: `${percent}%`,
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
