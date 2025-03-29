import React, { useCallback, useEffect, useMemo, useState } from 'react';
import fastDeepEqual from 'fast-deep-equal';
import { useSelector, useDispatch } from 'react-redux';
import { selectActivities, selectListActivities, selectZoneGroupedRuns } from '../reducers/activities';
import { selectListPrerences } from '../reducers/preferences';
import { idle, loading, success, useGetApiStatus } from '../reducers/apiStatus';
import { triggerFetchActivities } from '../reducers/activities-actions';
import ZonesHeader from './ZonesHeader';
import CurrentSummary from './CurrentSummary';
import ConfigWidget from '../Config';
import ListSort from './ListSort';
import Shimmer from '../Loading/Shimmer';
import PreferenceControl from '../PreferenceControl';
import { listDisplayConfigControls, listDisplayHideFunction } from '../PreferenceControl/keyPaths';
import usePreferenceControl from '../hooks/usePreferenceControl';
import ActivityTile from './ActivityTile';
import PRs from './PRs';
import { Basic, Button, Flex } from '../DLS';
import useShowAfterMount from '../hooks/useShowAfterMount';
import { useAppSelector } from '../hooks/redux';
import dayjs from 'dayjs';
import SpeedChart from '../Common/SpeedChart';

const HeatMapContainer = React.lazy(() => import('./HeatMapContainer'));

const hideFunctionKeypath = listDisplayHideFunction();
const listDisplayControlsKeypath = listDisplayConfigControls();

const Activities = () => {
  const showChart = useShowAfterMount();
  const [showAllActivities, setShowAllActivities] = useState(false);
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

  const runs = useAppSelector((state) => selectListActivities(state, 0, showAllActivities ? undefined: 10));

  const onClickSync = useCallback(() => {
    dispatch(triggerFetchActivities(true));
  }, [dispatch]);

  return (
    <Basic.Div $pad={2}>
      <Basic.Div $display="flex" $directionLgUp="row-reverse" $directionMdDown="column" $gap={1}>
        <Basic.Div $widthLgUp="50%">
          <Basic.Div $marginB={1}>
            {showChart
              ? <SpeedChart activities={recentActivities} />
              : <Basic.Div $height="600px" />
            }
          </Basic.Div>
          <React.Suspense fallback={<Basic.Div $height="900px"><Shimmer isVisible={true} /></Basic.Div>}>
            <Basic.Div $fontSize="h2" $marginB={1}>All time</Basic.Div>
            <HeatMapContainer />
          </React.Suspense>
        </Basic.Div>
        <Basic.Div $widthLgUp="50%">
          <div>
            <Button onClick={onClickSync}>Sync Strava</Button>
          </div>
          <Basic.Div $marginT={1}>
            <PRs />
          </Basic.Div>
          <Basic.Div $marginT={1} $marginB={1}>
            <CurrentSummary activities={activities} />
          </Basic.Div>
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
            <Basic.Div $flexGrow="1">
              {/* {
                activitiesApiStatus === success && (
                  // categorizeRunsByZones.map(({ runs, zones, start }) => (
                  //   <Flex $direction="column" $gap={1} key={start}>
                  //     {isGroupByZonesSet && (
                  //       <Basic.Div
                  //         $marginT={3}
                  //         $marginB={1}
                  //         $position='sticky'
                  //         $top={0}
                  //         $zIndex={1}
                  //         $colorBg='white'
                  //       >
                  //         <ZonesHeader zones={zones} start={start} />
                  //       </Basic.Div>
                  //     )} */}
                      <Flex $direction="column" $gap={1}>
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
                    {/* // </Flex>
                  ))
                )
              } */}
            </Basic.Div>
          </Flex>
          <Button $width="100%" onClick={() => setShowAllActivities(true)}>Show All</Button>
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
