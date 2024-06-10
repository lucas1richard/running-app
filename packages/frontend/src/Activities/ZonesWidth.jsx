import React, { useMemo } from 'react';
import { convertHeartDataToZonePercents, convertZonesCacheToPercents } from '../utils';
import { hrZonesText } from '../colors/hrZones';

const ZonesWidth = ({ zones, heartData, id, zonesCaches }) => {
  const percents = useMemo(() => {
    if (zonesCaches?.[zones.id]) return convertZonesCacheToPercents(zonesCaches[zones.id]);
    return convertHeartDataToZonePercents(heartData, zones)
  }, [heartData, zones, zonesCaches]);

  if (!zones && !heartData) return null;

  return (
    <div className="flex">
      {percents.filter((n) => Boolean(Number(n))).map((percent, ix) => (
        <div
          key={`${percent}-${ix}-${id}`}
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
