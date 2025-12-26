import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import propSelector from '../utils/propSelector';
import { Basic, Flex } from '../DLS';

dayjs.extend(utc)

type ZonesHeaderProps = {
  zones: HeartZone;
  start: string;
  isCompact?: boolean;
};

const ZonesHeader: React.FC<ZonesHeaderProps> = ({ zones, start, isCompact }) => {
  const establishedText = `Since ${dayjs(start).utc().format(isCompact ? 'MM/DD/YY' : 'MMMM DD, YYYY')}`;
  const padLevel = propSelector({ 4: !isCompact, 2: isCompact });

  return (
    <div>
      {(start && !isCompact) && (
        <div className={`heading-2 p-${padLevel}`}>
          {establishedText}
        </div>
      )}
      <Flex $direction="column">
        <Flex $directionXs="column" $overflow="hidden">
          {(start && isCompact) && (
            <div className={`text-center flex-item-grow p-${padLevel}`}>
              {establishedText}
            </div>
          )}

          <div className={`text-center flex-item-grow p-${padLevel}`} style={{ backgroundColor: "var(--hrZone1)" }}>
            <b>Zone 1</b> ({zones.z1} - {zones.z2 - 1})
          </div>

          <div className={`text-center flex-item-grow p-${padLevel}`} style={{ backgroundColor: "var(--hrZone2)" }}>
            <b>Zone 2</b> ({zones.z2} - {zones.z3 - 1})
          </div>

          <div className={`text-center flex-item-grow p-${padLevel}`} style={{ backgroundColor: "var(--hrZone3)" }}>
            <b>Zone 3</b> ({zones.z3} - {zones.z4 - 1})
          </div>

          <div className={`text-center flex-item-grow p-${padLevel}`} style={{ backgroundColor: "var(--hrZone4)" }}>
            <b>Zone 4</b> ({zones.z4} - {zones.z5 - 1})
          </div>

          <div className={`text-center flex-item-grow p-${padLevel}`} style={{ backgroundColor: "var(--hrZone5)" }}>
            <b>Zone 5</b> (&ge; {zones.z5})
          </div>
        </Flex>
      </Flex>
    </div>
  );
};

export default ZonesHeader;
