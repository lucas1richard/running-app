import { Fragment, useCallback, useState } from 'react';
import dayjs, { type ManipulateType } from 'dayjs';
import { selectTimeGroupedRuns } from '../reducers/activities';
import { useAppSelector } from '../hooks/redux';
import { Basic, Card } from '../DLS';

const VolumeTable: React.FC<{ timeGroup: ManipulateType }> = ({ timeGroup = 'month' }) => {
  const [tg, setTimeGroup] = useState<ManipulateType>(timeGroup);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeGroup(e.target.value as ManipulateType);
  }, []);

  const activities = useAppSelector((state) => selectTimeGroupedRuns(state, tg));

  return (
    <Card $width="100%">
      <label htmlFor="timeGroupSelect">Time Group:</label>
      &nbsp;
      <select id="timeGroupSelect" value={tg} onChange={handleChange}>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>

      <Basic.Table $width="100%">
        {
          activities.map(({ start, sum, runs }) => (
            <Fragment key={start.toString()}>
              <Basic.Tr $position="sticky" $top="0" $zIndex="1" $colorBg="white">
                <th colSpan={3}>The {tg} starting {start.format('dddd MMMM, DD YYYY')} &darr;</th>
              </Basic.Tr>
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
      </Basic.Table>
    </Card>
  );
};

export default VolumeTable;
