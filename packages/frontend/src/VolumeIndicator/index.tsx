import { useCallback, useState } from 'react';
import dayjs, { OpUnitType } from 'dayjs';
import { useSelector } from 'react-redux';
import { selectTimeGroupedRuns } from '../reducers/activities';
import { Fragment } from 'react/jsx-runtime';

const VolumeIndicator: React.FC<{ timeGroup: OpUnitType }> = ({ timeGroup = 'month' }) => {
  const [tg, setTimeGroup] = useState<OpUnitType>(timeGroup);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeGroup(e.target.value as OpUnitType);
  }, []);
  
  // @ts-ignore-next-line - this is a selector
  const activities = useSelector((state) => selectTimeGroupedRuns(state, tg));

  return (
    <div className="card">
      <label htmlFor="timeGroupSelect">Time Group:</label>
      &nbsp;
      <select id="timeGroupSelect" value={tg} onChange={handleChange}>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>

      <div className="">
        <table className="">
        {
          activities.map(({ start, sum, runs }) => (
            <Fragment key={start.toString()}>
                <tr>
                  <th colSpan={3}>The {tg} starting {start.format('dddd MMMM, DD YYYY')} &darr;</th>
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
        </table>
      </div>
    </div>
  );
};

export default VolumeIndicator;
