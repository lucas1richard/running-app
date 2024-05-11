import React, { useMemo } from 'react';
import { getDuration } from '../utils';
import DurationDisplay from '../Common/DurationDisplay';

const HeartZonesDisplay = ({ zones, heartData }) => {
  const totalTimes = useMemo(() => {
    if (!heartData) return [];

    const rangeMap = [zones.z1, zones.z2, zones.z3, zones.z4, zones.z5, Number.POSITIVE_INFINITY];

    return heartData.reduce((acc, heartrate) => {
      const zone = rangeMap.findIndex((threshhold, ix) => threshhold <= heartrate && rangeMap[ix + 1] > heartrate);
      const newacc = [...acc];
      newacc[zone] = (newacc[zone] || 0) + 1;
      return newacc;
    }, new Array(5).fill(0));
  }, [heartData, zones.z1, zones.z2, zones.z3, zones.z4, zones.z5]);
  
  const percents = useMemo(() => {
    return totalTimes.map((time) => (100 * time / heartData?.length).toFixed(2));
  }, [totalTimes, heartData?.length]);

  return (
    <div style={{ border: '1px solid black', padding: '1rem' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '20%' }}>
          <div>
            <b>Zone 1</b> ({zones.z1} - {zones.z2 - 1})
          </div>
          <div>
             {percents[0]}%
          </div>
          <div>
            <DurationDisplay numSeconds={totalTimes[0]} />
          </div>
        </div>
        <div style={{ width: '20%' }}>
          <div>
            <b>Zone 2</b> ({zones.z2} - {zones.z3 - 1})
          </div>
          <div>
            {percents[1]}%
          </div>
          <div>
            <DurationDisplay numSeconds={totalTimes[1]} />
          </div>
        </div>
        <div style={{ width: '20%' }}>
          <div>
            <b>Zone 3</b> ({zones.z3} - {zones.z4 - 1})
          </div>
          <div>
            {percents[2]}%
          </div>
          <div>
            <DurationDisplay numSeconds={totalTimes[2]} />
          </div>
        </div>
        <div style={{ width: '20%' }}>
          <div>
            <b>Zone 4</b> ({zones.z4} - {zones.z5 - 1})
          </div>
          <div>
            {percents[3]}%
          </div>
          <div>
            <DurationDisplay numSeconds={totalTimes[3]} />
          </div>
        </div>
        <div style={{ width: '20%' }}>
          <div>
            <b>Zone 5</b> (>={zones.z5})
          </div>
          <div>
            {percents[4]}%
          </div>
          <div>
            <DurationDisplay numSeconds={totalTimes[4]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeartZonesDisplay;
