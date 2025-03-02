import React, { useCallback } from 'react';
import fastDeepEqual from 'fast-deep-equal';
import { useSelector, useDispatch } from 'react-redux';
import { selectActivities, selectZoneGroupedRuns } from '../reducers/activities';
import { selectListPrerences } from '../reducers/preferences';
import { idle, loading, success, useGetApiStatus } from '../reducers/apiStatus';
import { triggerFetchActivities } from '../reducers/activities-actions';
import ZonesHeader from './ZonesHeader';
import CurrentSummary from './CurrentSummary';
import ConfigWidget from '../Config';
import SpeedChart from './SpeedChart';
import ListSort from './ListSort';
import Shimmer from '../Loading/Shimmer';
import PreferenceControl from '../PreferenceControl';
import { listDisplayConfigControls, listDisplayHideFunction } from '../PreferenceControl/keyPaths';
import usePreferenceControl from '../hooks/usePreferenceControl';
import ActivityTile from './ActivityTile';
import PRs from './PRs';
import { Basic, Button, Flex } from '../DLS';

const hideFunctionKeypath = listDisplayHideFunction();
const listDisplayControlsKeypath = listDisplayConfigControls();

const Activities = () => {
  const dispatch = useDispatch();
  const activities = useSelector(selectActivities, fastDeepEqual);
  const listPreferences = useSelector(selectListPrerences);
  const activitiesApiStatus = useGetApiStatus(triggerFetchActivities());
  const syncActivitiesApiStatus = useGetApiStatus(triggerFetchActivities(true));

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
    <Basic.Div pad={1} margin="auto" maxWidth="1600px">
      <Shimmer
        isVisible={(
          activitiesApiStatus === loading
          || activitiesApiStatus === idle
          || syncActivitiesApiStatus === loading
        )}
      />
      <div>
        <Button onClick={onClickSync}>Sync Strava</Button>
      </div>
      <Basic.Div marginT={1}>
        <PRs />
      </Basic.Div>
      <Basic.Div marginT={1}>
        <SpeedChart activities={activities} />
      </Basic.Div>
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
        <Button onClick={hideFn}>
          Toggle Display of Hide Functionality
        </Button>
      </PreferenceControl>

      <Flex>
        <Basic.Div flexGrow="1">
          {
            activitiesApiStatus === success && (
              categorizeRunsByZones.map(({ runs, zones, start }) => (
                <Flex direction="column" gap={1} key={start}>
                  {isGroupByZonesSet && (
                    <Basic.Div marginT={3} marginB={1}>
                      <ZonesHeader zones={zones} start={start} />
                    </Basic.Div>
                  )}
                  <Flex direction="column" gap={1}>
                    {runs.map((activity) => (
                      <ActivityTile
                        key={activity.id}
                        activity={activity}
                        className="card"
                        backgroundIndicator={tileBackgroundIndicator}
                        showHideFunction={showHideFunction}
                      />
                    ))}
                  </Flex>
                </Flex>
              ))
            )
          }
        </Basic.Div>
      </Flex>
    </Basic.Div>
  );
};

export default Activities;
