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
  variant?: 'linear' | 'circular';
  height?: CSSStyleDeclaration['height'];
  width?: CSSStyleDeclaration['width'];
};

const ZonesWidth: React.FC<ZonesWidthProps> = ({ zones, heartData, id, zonesCaches, variant = 'linear', height, width }) => {
  const percents = useMemo(() => {
    if (zonesCaches?.[zones.id]) return convertZonesCacheToPercents(zonesCaches[zones.id]);
    return convertHeartDataToZonePercents(heartData, zones)
  }, [heartData, zones, zonesCaches]);

  if (!zones && !heartData) return null;

  const bgColors = [
    'var(--hrZone1)',
    'var(--hrZone2)',
    'var(--hrZone3)',
    'var(--hrZone4)',
    'var(--hrZone5)',
  ];
  const borderColors = [
    'color-mix(in srgb, var(--hrZone1) 50%, black 20%)',
    'color-mix(in srgb, var(--hrZone2) 50%, black 20%)',
    'color-mix(in srgb, var(--hrZone3) 50%, black 20%)',
    'color-mix(in srgb, var(--hrZone4) 50%, black 20%)',
    'color-mix(in srgb, var(--hrZone5) 50%, black 20%)',
  ];

  const numPercents = percents.map(Number);
  const stops = [
    numPercents[0],
    numPercents[0] + numPercents[1],
    numPercents[0] + numPercents[1] + numPercents[2],
    numPercents[0] + numPercents[1] + numPercents[2] + numPercents[3],
    numPercents[0] + numPercents[1] + numPercents[2] + numPercents[3] + numPercents[4],
  ];
  
  const cssGradient = (colors: string[]) => [
    `${colors[0]} ${stops[0]}%`,
    `${colors[1]} ${stops[0]}%`,
    `${colors[1]} ${stops[1]}%`,
    `${colors[2]} ${stops[1]}%`,
    `${colors[2]} ${stops[2]}%`,
    `${colors[3]} ${stops[2]}%`,
    `${colors[3]} ${stops[3]}%`,
    `${colors[4]} ${stops[3]}%`,
    `${colors[4]} 100%`
  ]

  return (
    <>
      {variant === 'linear' && (
        <div
          className="elevation-1"
          style={{
            background: `linear-gradient(to right, ${cssGradient(bgColors).join(', ')})`, 
            border: `2px solid transparent`, 
            borderImage: `linear-gradient(to right, ${cssGradient(borderColors).join(', ')})`, 
          borderImageSlice: 1,
          height: height || '1rem'
        }}
      ></div>
      )}
      {variant === 'circular' && (
        <div
          className="border-neutral-900 border-1 elevation-4"
          style={{
            background: `conic-gradient(${cssGradient(bgColors).join(', ')})`,
            height: height  || '10rem',
            width: width || '10rem',
            borderRadius: '50%'
          }}
        />
      )}
      {/* <ZonesWidthPercents id={id} percents={percents} /> */}
    </>
  );
};

export default memo(ZonesWidth);
