import React, { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActivities } from '../reducers/activities';
import Tile from './Tile';
import { selectAllHeartZones } from '../reducers/heartszones';
import ZonesHeader from './ZonesHeader';

const Activities = () => {
  const dispatch = useDispatch();
  const activities = useSelector(selectActivities, (a, b) => a.length === b.length);
  const runs = useMemo(
    () => activities.filter(({ sport_type }) => sport_type === 'Run'),
    [activities]
  );
  //
  const allzones = useSelector(selectAllHeartZones);
  
  // heart rate zones should be ordered by `start_date` descending
  // return allzones.find(({ start_date }) => new Date(start_date) < currDate) || {};
  //
  
  const categorizeRunsByZones = runs.reduce((acc, run) => {
    const currDate = new Date(run.start_date_local);
    const zones = allzones.find(({ start_date }) => new Date(start_date) < currDate) || {};
    const { start_date } = zones;
    const entry = acc[acc.length - 1] || { runs: [] };
    if (start_date === entry.start) {
      entry.runs.push(run);
      return acc;
    }

    return [
      ...acc,
      {
        start: start_date,
        runs: [run],
        zones,
      }
    ]
  }, []);

  console.log(categorizeRunsByZones)

  const onClickSync = useCallback(() => {
    dispatch({ type: 'activities/FETCH_ACTIVITIES', forceFetch: true });
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <div>
        <button onClick={onClickSync}>Sync Strava</button>
      </div>
        {categorizeRunsByZones.map(({ runs, zones, start }) => (
          <>
            <div style={{ marginTop: '3rem' }}>
              <ZonesHeader zones={zones} start={start} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', }}>
                {runs.map((activity) => (
                  <Tile key={activity.id} activity={activity} zones={zones} />
                ))}
            </div>
          </>
        ))}
    </div>
  );
};

export default Activities;
