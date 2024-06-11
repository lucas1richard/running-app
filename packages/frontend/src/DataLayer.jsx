import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetApiStatus } from './reducers/apiStatus';
import {
  FETCH_ACTIVITIES,
  FETCH_ACTIVITIES_SUMMARY,
  triggerFetchActivities,
  triggerFetchActivitiesSummary,
} from './reducers/activities-actions';
import {
  FETCH_USER_PREFS,
  triggerFetchUserPrefs,
} from './reducers/preferences-actions';
import { triggerFetchHeartZones } from './reducers/heartzones-actions';

const DataLayer = ({ children }) => {
  const dispatch = useDispatch();

  const prefStatus = useGetApiStatus(FETCH_USER_PREFS);
  const activitiesStatus = useGetApiStatus(FETCH_ACTIVITIES);
  const activitiesSummaryStatus = useGetApiStatus(FETCH_ACTIVITIES_SUMMARY);
  const heartZonesStatus = useGetApiStatus('heartzones/FETCH_HEART_ZONES');

  useEffect(() => {
    if (prefStatus === 'idle') dispatch(triggerFetchUserPrefs());
    if (activitiesStatus === 'idle') dispatch(triggerFetchActivities());
    if (activitiesSummaryStatus === 'idle') dispatch(triggerFetchActivitiesSummary());
    if (heartZonesStatus === 'idle') dispatch(triggerFetchHeartZones());
  }, [activitiesStatus, activitiesSummaryStatus, dispatch, heartZonesStatus, prefStatus]);

  return (<>{children}</>);
};

export default DataLayer;
