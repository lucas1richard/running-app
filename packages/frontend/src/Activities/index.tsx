import CurrentSummary from '@/Activities/CurrentSummary';
import ListSort from '@/Activities/ListSort';
import PRs from '@/Activities/PRs';
import TileList from '@/Activities/TileList';
import SpeedChart from '@/Common/SpeedChart';
import ConfigWidget from '@/Config';
import { Basic, Button } from '@/DLS';
import Surface from '@/DLS/Surface';
import Shimmer from '@/Loading/Shimmer';
import PreferenceControl from '@/PreferenceControl';
import { listDisplayConfigControls, listDisplayHideFunction } from '@/PreferenceControl/keyPaths';
import usePreferenceControl from '@/hooks/usePreferenceControl';
import useShowAfterMount from '@/hooks/useShowAfterMount';
import { selectActivities } from '@/reducers/activities';
import { triggerFetchActivities } from '@/reducers/activities-actions';
import { selectListPrerences } from '@/reducers/preferences';

import dayjs from 'dayjs';
import fastDeepEqual from 'fast-deep-equal';
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const HeatMapContainer = React.lazy(() => import('@/Activities/HeatMapContainer'));

const hideFunctionKeypath = listDisplayHideFunction();
const listDisplayControlsKeypath = listDisplayConfigControls();

const Activities = () => {
  const showChart = useShowAfterMount();
  const dispatch = useDispatch();
  const activities = useSelector(selectActivities, fastDeepEqual);
  const listPreferences = useSelector(selectListPrerences);

  const [showHideFunction, setShowHideFunction] = usePreferenceControl(hideFunctionKeypath, false);
  const hideFn = useCallback(
    () => setShowHideFunction(!showHideFunction),
    [setShowHideFunction, showHideFunction]
  );

  const { tileBackgroundIndicator } = listPreferences;
  const recentActivities = useMemo(() => {
    const earliestDate = dayjs().subtract(3, 'year');
    return activities.filter(({ start_date }) => dayjs(start_date).isAfter(earliestDate)).reverse();
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
            <HeatMapContainer localStorageKey="homepage:heatmap:bounds" />
          </React.Suspense>
        </Basic.Div>
        <Basic.Div $widthLgUp="50%">
          <div>
            <Button onClick={onClickSync}>Sync Activities</Button>
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
