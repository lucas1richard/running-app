import React, { memo, useMemo } from 'react';
import { convertHeartDataToZonePercents, convertZonesCacheToPercents } from '../utils';
import { hrZonesText } from '../colors/hrZones';
import { Flex } from '../DLS';

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

  const widthStyles = useMemo(() => {
    return percents.filter((n) => Boolean(Number(n))).map((percent, ix) => ({
      width: `${percent}%`,
      background: hrZonesText[ix + 1],
      border: `1px solid ${hrZonesText[ix + 1]}`,
      height: '1rem',
      overflow: 'hidden',
    }));
  }, []);

  if (!zones && !heartData) return null;

  return (
    <div>
      <Flex>
        {widthStyles.map((style, ix) => (
          <div
            key={`${style.background}-${ix}-${id}`}
            style={style}
          />
        ))}
      </Flex>
    </div>
  );
};

export default memo(ZonesWidth);
