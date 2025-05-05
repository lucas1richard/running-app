import React, { memo, useMemo } from 'react';
import { convertHeartDataToZonePercents, convertZonesCacheToPercents } from '../utils';
import { hrZonesText } from '../colors/hrZones';

export const ZonesWidthPercents: React.FC<{ id: string | number, percents: string[] }> = memo(({ id, percents = [] }) => {
  const widthStyles = percents.filter((n) => Boolean(Number(n))).map((percent, ix) => ({
      width: `${percent}%`,
      height: '1rem',
      overflow: 'hidden',
    }));

  return (
    <div>
      <div className="flex">
        {widthStyles.map((style, ix) => (
          <div
            key={`${ix}-${id}`}
            style={style}
            className={`hr-zone-${ix + 1}-bg hr-zone-${ix + 1}-border`}
            title={`Heart Rate Zone ${ix + 1}: ${style.width}`}
          />
        ))}
      </div>
    </div>
  );
})

type ZonesWidthProps = {
  zones: HeartZone;
  heartData: number[];
  id: number | string;
  zonesCaches: Record<string, HeartZoneCache>;
};

const ZonesWidth: React.FC<ZonesWidthProps> = ({ zones, heartData, id, zonesCaches }) => {
  const percents = useMemo(() => {
    if (zonesCaches?.[zones.id]) return convertZonesCacheToPercents(zonesCaches[zones.id]);
    return convertHeartDataToZonePercents(heartData, zones)
  }, [heartData, zones, zonesCaches]);

  if (!zones && !heartData) return null;

  return (
    <ZonesWidthPercents id={id} percents={percents} />
  );
};

export default memo(ZonesWidth);
