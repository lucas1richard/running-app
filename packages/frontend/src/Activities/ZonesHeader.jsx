import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { hrZonesBg } from '../colors/hrZones';

dayjs.extend(utc)

const ZonesHeader = ({ zones, start, isCompact }) => {
  const padding = isCompact ? '0.5rem' : '1rem';
  const establishedText = `Since ${dayjs(start).utc().format(isCompact ? 'MM/DD/YY' : 'MMMM DD, YYYY')}`;
  return (
    <div>
      {(start && !isCompact) && (
        <h2>
          {establishedText}
        </h2>
      )}
      <div>
        <div className="flex">
          {(start && isCompact) && (
            <div className="flex-item-grow dls-white-bg" style={{ padding }}>
              <div className="text-center">
                <b>{establishedText}</b>
              </div>
            </div>
          )}
          <div className="flex-item-grow" style={{ padding, background: hrZonesBg[1] }}>
            <div className="text-center">
              <b>Zone 1</b> ({zones.z1} - {zones.z2 - 1})
            </div>
          </div>
          <div className="flex-item-grow" style={{ padding, background: hrZonesBg[2] }}>
            <div className="text-center">
              <b>Zone 2</b> ({zones.z2} - {zones.z3 - 1})
            </div>
          </div>
          <div className="flex-item-grow" style={{ padding, background: hrZonesBg[3] }}>
            <div className="text-center">
              <b>Zone 3</b> ({zones.z3} - {zones.z4 - 1})
            </div>
          </div>
          <div className="flex-item-grow" style={{ padding, background: hrZonesBg[4] }}>
            <div className="text-center">
              <b>Zone 4</b> ({zones.z4} - {zones.z5 - 1})
            </div>
          </div>
          <div className="flex-item-grow" style={{ padding, background: hrZonesBg[5] }}>
            <div className="text-center">
              <b>Zone 5</b> (>={zones.z5})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZonesHeader;
