import React, { useCallback } from 'react';
import fastDeepEqual from 'fast-deep-equal';
import { useSelector, useDispatch } from 'react-redux';
import { selectActivities, selectZoneGroupedRuns } from '../reducers/activities';
import ZonesHeader from './ZonesHeader';
import CurrentSummary from './CurrentSummary';
import ConfigWidget from '../Config';
import SpeedChart from './SpeedChart';
import { selectListPrerences } from '../reducers/preferences';
import ListSort from './ListSort';
import { idle, loading, success, useGetApiStatus } from '../reducers/apiStatus';
import Shimmer from '../Loading/Shimmer';
import { FETCH_ACTIVITIES, triggerFetchActivities } from '../reducers/activities-actions';
import PreferenceControl from '../PreferenceControl';
import { listDisplayConfigControls, listDisplayHideFunction } from '../PreferenceControl/keyPaths';
import usePreferenceControl from '../hooks/usePreferenceControl';
import ActivityTile from './ActivityTile';
import PRs from './PRs';

const style = { padding: '1rem', margin: 'auto', maxWidth: 1600 };
const hideFunctionKeypath = listDisplayHideFunction();
const listDisplayControlsKeypath = listDisplayConfigControls();

const Activities = () => {
  const dispatch = useDispatch();
  const activities = useSelector(selectActivities, fastDeepEqual);
  const listPreferences = useSelector(selectListPrerences);
  const activitiesApiStatus = useGetApiStatus(FETCH_ACTIVITIES);
  const [showHideFunction, setShowHideFunction] = usePreferenceControl(hideFunctionKeypath, false);
  const hideFn = useCallback(
    () => setShowHideFunction(!showHideFunction),
    [setShowHideFunction, showHideFunction]
  );

  const { isGroupByZonesSet, tileBackgroundIndicator } = listPreferences;

  const categorizeRunsByZones = useSelector(selectZoneGroupedRuns);

  const onClickSync = useCallback(() => {
    dispatch(triggerFetchActivities(true));
  }, [dispatch]);

  return (
    <div style={style}>
      <Shimmer isVisible={(activitiesApiStatus === loading || activitiesApiStatus === idle)} />
      <div>
        <button onClick={onClickSync}>Sync Strava</button>
      </div>
      <div className="margin-t">
        <PRs />
      </div>
      <div className="margin-t">
        <SpeedChart activities={activities} />
      </div>
      <div>
        <CurrentSummary activities={activities} />
      </div>
      <PreferenceControl
        subject="Display Config"
        keyPath={listDisplayControlsKeypath}
        showSaveButton={true}
        defaultValue={true}
      >
        <ConfigWidget />
        <ListSort />
        <button onClick={hideFn}>
          Toggle Display of Hide Functionality
        </button>
      </PreferenceControl>

      <div className="flex">
        <div className="flex-item-grow">
          {
            activitiesApiStatus === success && (
              categorizeRunsByZones.map(({ runs, zones, start }) => (
                <div className="flex flex-column gap" key={start}>
                  {isGroupByZonesSet && (
                    <div className="margin-tb" style={{ marginTop: '3rem' }}>
                      <ZonesHeader zones={zones} start={start} />
                    </div>
                  )}
                  <div className="flex flex-column gap">
                    {runs.map((activity) => (
                      <ActivityTile
                        key={activity.id}
                        activity={activity}
                        backgroundIndicator={tileBackgroundIndicator}
                        showHideFunction={showHideFunction}
                      />
                    ))}
                  </div>
                </div>
              ))
            )
          }
        </div>
      </div>
    </div>
  );
};

export default Activities;
