import React, { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActivities } from '../reducers/activities';
import Tile from './Tile';
import { selectAllHeartZones } from '../reducers/heartszones';
import ZonesHeader from './ZonesHeader';
import CurrentSummary from './CurrentSummary';
import ConfigWidget from '../Config';
import SpeedChart from './SpeedChart';

const Activities = () => {
  const dispatch = useDispatch();
  const activities = useSelector(selectActivities, (a, b) => a.length === b.length);

  const allzones = useSelector(selectAllHeartZones);
  
  const categorizeRunsByZones = useMemo(() => activities.reduce((acc, run) => {
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
  }, []), [activities, allzones]);

  const onClickSync = useCallback(() => {
    dispatch({ type: 'activities/FETCH_ACTIVITIES', forceFetch: true });
  }, [dispatch]);

  return (
    <div style={{ padding: '1rem', margin: 'auto', maxWidth: 1280 }}>
      <div>
        <button onClick={onClickSync}>Sync Strava</button>
      </div>
      <div>
        <SpeedChart activities={activities} />
      </div>
      <div>
        <CurrentSummary activities={activities} />
      </div>
      <ConfigWidget />
        {categorizeRunsByZones.map(({ runs, zones, start }) => (
          <div>
            <div className="margin-tb" style={{ marginTop: '3rem' }}>
              <ZonesHeader zones={zones} start={start} />
            </div>
            <div className="flex flex-column gap">
              {runs.map((activity) => (
                <Tile key={activity.id} activity={activity} zones={zones} />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Activities;
