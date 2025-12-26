import React, { useCallback, useMemo } from 'react';
import fastDeepEqual from 'fast-deep-equal';
import { useSelector, useDispatch } from 'react-redux';
import { selectActivities } from '../reducers/activities';
import { selectListPrerences } from '../reducers/preferences';
import { useGetApiStatus } from '../reducers/apiStatus';
import { triggerFetchActivities } from '../reducers/activities-actions';
import CurrentSummary from './CurrentSummary';
import ConfigWidget from '../Config';
import ListSort from './ListSort';
import Shimmer from '../Loading/Shimmer';
import PreferenceControl from '../PreferenceControl';
import { listDisplayConfigControls, listDisplayHideFunction } from '../PreferenceControl/keyPaths';
import usePreferenceControl from '../hooks/usePreferenceControl';
import PRs from './PRs';
import { Basic, Button } from '../DLS';
import useShowAfterMount from '../hooks/useShowAfterMount';
import dayjs from 'dayjs';
import SpeedChart from '../Common/SpeedChart';
import TileList from './TileList';
import Surface from '../DLS/Surface';

const HeatMapContainer = React.lazy(() => import('./HeatMapContainer'));

const hideFunctionKeypath = listDisplayHideFunction();
const listDisplayControlsKeypath = listDisplayConfigControls();

const Activities = () => {
  const showChart = useShowAfterMount();
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
  const recentActivities = useMemo(() => {
    const oneYearAgo = dayjs().subtract(1, 'year');
    return activities.filter(({ start_date }) => dayjs(start_date).isAfter(oneYearAgo)).reverse();
  }, [activities]);

  const onClickSync = useCallback(() => {
    dispatch(triggerFetchActivities(true));
  }, [dispatch]);

  return (
    <Basic.Div $pad={2}>
      <Basic.Div $display="flex" $directionLgUp="row-reverse" $directionMdDown="column" $gap={1}>
        <Basic.Div $widthLgUp="50%">
          <Basic.Div $marginB={1}>
            <h2 className="text-h2 pad-b">Metrics Over Time</h2>
            {showChart
              ? <SpeedChart activities={recentActivities} />
              : <Basic.Div $height="600px" />
            }
          </Basic.Div>
          <React.Suspense fallback={<Basic.Div $height="900px"><Shimmer isVisible={true} /></Basic.Div>}>
            <Basic.Div $fontSize="h2" $marginB={1}>Heat Map - All time</Basic.Div>
            <HeatMapContainer />
          </React.Suspense>
        </Basic.Div>
        <Basic.Div $widthLgUp="50%">
          <div>
            <Button onClick={onClickSync}>Sync Strava</Button>
          </div>
          <div className="mt-4">
            <PRs />
          </div>
          <div className="my-4">
            <h2 className="text-h2 pad-b">Mileage</h2>
            <CurrentSummary activities={activities} />
          </div>
          <div className="mb-4">
            <PreferenceControl
              subject="Display Config"
              keyPath={listDisplayControlsKeypath}
              showSaveButton={true}
              defaultValue={true}
            >
              <Surface className="card pad">
                <ConfigWidget />
                <ListSort />
                <Button onClick={hideFn}>
                  Toggle Display of Hide Functionality
                </Button>
              </Surface>
            </PreferenceControl>
          </div>

          <h2 className="text-h2 pad-b">Activities</h2>
          <TileList
            showHideFunction={showHideFunction}
            tileBackgroundIndicator={tileBackgroundIndicator}
          />
          
        </Basic.Div>
      </Basic.Div>
      {/* <Shimmer
        isVisible={(
          activitiesApiStatus === loading
          || activitiesApiStatus === idle
          || syncActivitiesApiStatus === loading
        )}
      /> */}
      
    </Basic.Div>
  );
};

export default Activities;
