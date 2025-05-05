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
  const padLevel = propSelector({ 1: !isCompact, 0.5: isCompact });

  return (
    <div>
      {(start && !isCompact) && (
        <Basic.Div $fontSize="h2" $pad={padLevel}>
          {establishedText}
        </Basic.Div>
      )}
      <Flex $direction="column">
        <Flex $directionXs="column" $overflow="hidden">
          {(start && isCompact) && (
            <Basic.Div
              $textAlign="center"
              $flexGrow="1"
              $pad={padLevel}
            >
              {establishedText}
            </Basic.Div>
          )}

          <Basic.Div $textAlign="center" $flexGrow="1" $colorBg="hrZone1" $pad={padLevel}>
            <b>Zone 1</b> ({zones.z1} - {zones.z2 - 1})
          </Basic.Div>

          <Basic.Div $textAlign="center" $flexGrow="1" $colorBg="hrZone2" $pad={padLevel}>
            <b>Zone 2</b> ({zones.z2} - {zones.z3 - 1})
          </Basic.Div>

          <Basic.Div $textAlign="center" $flexGrow="1" $colorBg="hrZone3" $pad={padLevel}>
            <b>Zone 3</b> ({zones.z3} - {zones.z4 - 1})
          </Basic.Div>

          <Basic.Div $textAlign="center" $flexGrow="1" $colorBg="hrZone4" $pad={padLevel}>
            <b>Zone 4</b> ({zones.z4} - {zones.z5 - 1})
          </Basic.Div>

          <Basic.Div $textAlign="center" $flexGrow="1" $colorBg="hrZone5" $pad={padLevel}>
            <b>Zone 5</b> (&ge; {zones.z5})
          </Basic.Div>
        </Flex>
      </Flex>
    </div>
  );
};

export default ZonesHeader;
