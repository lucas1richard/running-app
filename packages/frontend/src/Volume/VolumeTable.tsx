import { ZonesWidthPercents } from '@/Activities/ZonesWidth';
import { Basic } from '@/DLS';
import Surface from '@/DLS/Surface';
import { useAppSelector } from '@/hooks/redux';
import { selectActivitiesByTimeGroup } from '@/reducers/activities';
import { convertZonesCacheToPercents } from '@/utils';
import dayjs, { type ManipulateType } from 'dayjs';
import React, { Fragment, useCallback, useState } from 'react';

const VolumeTable: React.FC<{ timeGroup: ManipulateType; }> = ({ timeGroup = 'month' }) => {
  const [tg, setTimeGroup] = useState<ManipulateType>(timeGroup);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeGroup(e.target.value as ManipulateType);
  }, []);

  const activities = useAppSelector((state) => selectActivitiesByTimeGroup(state, tg));

  return (
    <div className="card">
      <label htmlFor="timeGroupSelect">Time Group:</label>
      &nbsp;
      <select id="timeGroupSelect" value={tg} onChange={handleChange}>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '0.25rem', marginTop: '1rem' }}>
        {activities.map(({ zones, runs, start }, ix) => (
          <React.Fragment key={start.toString()}>
            {ix === 0 || dayjs(start).format('MMM YYYY') !== dayjs(activities[ix - 1].start).format('MMM YYYY') ? (
              <div className="text-xs">
                {dayjs(start).format('MMM YYYY')}
              </div>
            ) : <div className='text-xs'>&nbsp;</div>}
            <div className="flex-item-grow">
              <ZonesWidthPercents
                percents={convertZonesCacheToPercents(zones)}
                id={runs[0]?.id}
                height="100%"
              />
            </div>
          </React.Fragment>
        ))}
      </div>

      {
        activities.map(({ start, sum, runs, zones }) => (
          <Surface key={start.toString()} className="mb-4 p-4 card raised-2">
            <Basic.Table key={start.toString()} $width="100%">
              <tbody>
                <Fragment key={start.toString()}>
                  <Basic.Tr $position="sticky" $top="0" $zIndex="1">
                    <th colSpan={3}>
                      The {tg} starting {start.format('dddd MMMM, DD YYYY')} &darr;
                    </th>
                  </Basic.Tr>
                  <tr>
                    <td colSpan={3}>
                      <ZonesWidthPercents
                        percents={convertZonesCacheToPercents(zones)}
                        id={runs[0]?.id}
                      />
                    </td>
                  </tr>
                  {
                    runs.map((run, ix) => (
                      <tr key={run.id}>
                        <td>
                          {dayjs(run.start_date_local).format('dddd MM/DD')}
                        </td>
                        <td>
                          {run.distance_miles.toFixed(2)} miles
                        </td>
                        {ix === 0 && <td rowSpan={runs.length}>{sum.toFixed(2)} miles</td>}
                      </tr>
                    ))
                  }
                </Fragment>
              </tbody>
            </Basic.Table>
          </Surface>
        ))
      }
    </div>
  );
};

export default VolumeTable;
