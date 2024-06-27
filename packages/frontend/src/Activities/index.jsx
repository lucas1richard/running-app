import React, { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActivities } from '../reducers/activities';
import Tile from './Tile';
import { selectAllHeartZones } from '../reducers/heartzones';
import ZonesHeader from './ZonesHeader';
import CurrentSummary from './CurrentSummary';
import ConfigWidget from '../Config';
import SpeedChart from './SpeedChart';
import { selectListPrerences } from '../reducers/preferences';
import ListSort from './ListSort';
import { useGetApiStatus, useGetLoadingKeys } from '../reducers/apiStatus';
import Shimmer from '../Loading/Shimmer';
import { FETCH_ACTIVITIES, triggerFetchActivities } from '../reducers/activities-actions';
import { TRIGGER_UPDATE_ACTIVITY, triggerUpdateActivity } from '../reducers/activitydetail-actions';
import Spinner from '../Loading/Spinner';

const Activities = () => {
  const dispatch = useDispatch();
  const activities = useSelector(selectActivities);
  const allzones = useSelector(selectAllHeartZones);
  const listPreferences = useSelector(selectListPrerences);
  const activitiesApiStatus = useGetApiStatus(FETCH_ACTIVITIES);
  const loadingKeys = useGetLoadingKeys();

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
    dispatch(triggerFetchActivities(true));
  }, [dispatch]);

  return (
    <div style={{ padding: '1rem', margin: 'auto', maxWidth: 1280 }}>
      <Shimmer isVisible={(activitiesApiStatus === 'loading' || activitiesApiStatus === 'idle')} />
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
                  <div key={activity.id}>
                    <Tile
                      activity={activity}
                      zones={zones}
                      backgroundIndicator={tileBackgroundIndicator}
                    />
                    <div className="text-right">
                      {loadingKeys.includes(`${TRIGGER_UPDATE_ACTIVITY}-${activity.id}`)
                        ? <Spinner />
                        : (
                        <label htmlFor={`${activity.id}-hider`}>
                          Hide
                          <input
                            id={`${activity.id}-hider`}
                            type="checkbox"
                            checked={activity.hidden}
                            onChange={() => dispatch(triggerUpdateActivity({ id: activity.id, hidden: !activity.hidden }))}
                          />
                        </label>
                        )}
                    </div>
                  </div>
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
