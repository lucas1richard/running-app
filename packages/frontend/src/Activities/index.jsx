import React, { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActivities } from '../reducers/activities';
import Tile from './Tile';
import { selectAllHeartZones } from '../reducers/heartszones';
import ZonesHeader from './ZonesHeader';
import CurrentSummary from './CurrentSummary';
import ConfigWidget from '../Config';
import SpeedChart from './SpeedChart';
import { selectListPrerences } from '../reducers/preferences';
import ListSort from './ListSort';
import { makeStatusSelector } from '../reducers/apiStatus';
import Spinner from '../Loading/Spinner';

const Activities = () => {
  const dispatch = useDispatch();
  const activities = useSelector(selectActivities);
  const allzones = useSelector(selectAllHeartZones);
  const listPreferences = useSelector(selectListPrerences);
  const activitiesApiStatus = useSelector(makeStatusSelector('activities/FETCH_ACTIVITIES'));
  console.log({ activitiesApiStatus })

  const { isGroupByZonesSet, tileBackgroundIndicator } = listPreferences;
  

  const categorizeRunsByZones = useMemo(() => {
    if (!isGroupByZonesSet) {
      return [{ runs: activities, zones: {}, start: '' }];
    }
    const dict = new Map();
    activities.forEach((run) => {
      const currDate = new Date(run.start_date_local);
      const zones = allzones.find(({ start_date }) => new Date(start_date) < currDate) || {};
      const { start_date } = zones;
      if (!dict.has(start_date)) {
        dict.set(start_date, { start: start_date, runs: [], zones });
      }
      dict.get(start_date).runs.push(run);
    });

    const vals = Array.from(dict.values());
    vals.sort((a, b) => new Date(b.start) - new Date(a.start));
    
    return vals;
  }, [activities, allzones, isGroupByZonesSet]);

  const onClickSync = useCallback(() => {
    dispatch({ type: 'activities/FETCH_ACTIVITIES', forceFetch: true });
  }, [dispatch]);

  if (
    (activitiesApiStatus === 'loading' || activitiesApiStatus === 'idle')
  ) {
    console.log('quack')
    return <Spinner />;
  }

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
      <ListSort />
      
      {
        activitiesApiStatus === 'success' && (
          categorizeRunsByZones.map(({ runs, zones, start }) => (
            <div className="flex flex-column gap" key={start}>
              {isGroupByZonesSet && (
                <div className="margin-tb" style={{ marginTop: '3rem' }}>
                  <ZonesHeader zones={zones} start={start} />
                </div>
              )}
              <div className="flex flex-column gap">
                {runs.map((activity) => (
                  <Tile
                    key={activity.id}
                    activity={activity}
                    zones={zones}
                    backgroundIndicator={tileBackgroundIndicator}
                  />
                ))}
              </div>
            </div>
          ))
        )
      }
    </div>
  );
};

export default Activities;
