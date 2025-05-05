import { Fragment, useCallback, useState } from 'react';
import dayjs, { type ManipulateType } from 'dayjs';
import { selectTimeGroupedRuns } from '../reducers/activities';
import { useAppSelector } from '../hooks/redux';
import { Basic, Card } from '../DLS';
import { ZonesWidthPercents } from '../Activities/ZonesWidth';
import { convertZonesCacheToPercents } from '../utils';
import Surface from '../DLS/Surface';

const VolumeTable: React.FC<{ timeGroup: ManipulateType }> = ({ timeGroup = 'month' }) => {
  const [tg, setTimeGroup] = useState<ManipulateType>(timeGroup);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeGroup(e.target.value as ManipulateType);
  }, []);

  const activities = useAppSelector((state) => selectTimeGroupedRuns(state, tg));

  return (
    <Surface className="card">
      <label htmlFor="timeGroupSelect">Time Group:</label>
      &nbsp;
      <select id="timeGroupSelect" value={tg} onChange={handleChange}>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>

      <div>
        {activities.map(({ zones, runs }) => (
          <ZonesWidthPercents
            percents={convertZonesCacheToPercents(zones)}
            id={runs[0]?.id}
          />
        ))}
      </div>

      <Basic.Table $width="100%">
        <tbody>
          {
            activities.map(({ start, sum, runs, zones }) => (
              <Fragment key={start.toString()}>
                <Basic.Tr $position="sticky" $top="0" $zIndex="1">
                  <th colSpan={3}>
                    <Surface>
                      The {tg} starting {start.format('dddd MMMM, DD YYYY')} &darr;
                    </Surface>
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
            ))
          }
        </tbody>
      </Basic.Table>
    </Surface>
  );
};

export default VolumeTable;
