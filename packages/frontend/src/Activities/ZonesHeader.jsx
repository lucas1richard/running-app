import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import classNames from 'classnames';

dayjs.extend(utc)

const ZonesHeader = ({ zones, start, isCompact }) => {
  const establishedText = `Since ${dayjs(start).utc().format(isCompact ? 'MM/DD/YY' : 'MMMM DD, YYYY')}`;
  return (
    <div>
      {(start && !isCompact) && (
        <h2>
          {establishedText}
        </h2>
      )}
      <div>
        <div className="flex border-radius-1">
          {(start && isCompact) && (
            <div
              className={classNames(
                `flex-item-grow dls-white-bg`, { pad: !isCompact, 'pad-compact': isCompact }
              )}
            >
              <div className="text-center">
                <b>{establishedText}</b>
              </div>
            </div>
          )}

          <div
            className={classNames(
              `flex-item-grow hr-zone-1-bg`, { pad: !isCompact, 'pad-compact': isCompact }
            )}
          >
            <div className="text-center">
              <b>Zone 1</b> ({zones.z1} - {zones.z2 - 1})
            </div>
          </div>

          <div
            className={classNames(
              `flex-item-grow hr-zone-2-bg`, { pad: !isCompact, 'pad-compact': isCompact }
            )}
          >
            <div className="text-center">
              <b>Zone 2</b> ({zones.z2} - {zones.z3 - 1})
            </div>
          </div>

          <div
            className={classNames(
              `flex-item-grow hr-zone-3-bg`, { pad: !isCompact, 'pad-compact': isCompact }
            )}
          >
            <div className="text-center">
              <b>Zone 3</b> ({zones.z3} - {zones.z4 - 1})
            </div>
          </div>

          <div
            className={classNames(
              `flex-item-grow hr-zone-4-bg`, { pad: !isCompact, 'pad-compact': isCompact }
            )}
          >
            <div className="text-center">
              <b>Zone 4</b> ({zones.z4} - {zones.z5 - 1})
            </div>
          </div>

          <div
            className={classNames(
              `flex-item-grow hr-zone-5-bg`, { pad: !isCompact, 'pad-compact': isCompact }
            )}
          >
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
