import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetApiStatus } from './reducers/apiStatus';

const DataLayer = ({ children }) => {
  const dispatch = useDispatch();

  const prefStatus = useGetApiStatus('preferences/FETCH_USER_PREFERENCES');
  const activitiesStatus = useGetApiStatus('activities/FETCH_ACTIVITIES');
  const activitiesSummaryStatus = useGetApiStatus('activities/FETCH_ACTIVITIES_SUMMARY');
  const heartZonesStatus = useGetApiStatus('heartzones/FETCH_HEART_ZONES');

  useEffect(() => {
    if (prefStatus === 'idle') {
      dispatch({ type: 'preferences/FETCH_USER_PREFERENCES' });
    }
    if (activitiesStatus === 'idle') {
      dispatch({ type: 'activities/FETCH_ACTIVITIES' });
    }
    if (activitiesSummaryStatus === 'idle') {
      dispatch({ type: 'activities/FETCH_ACTIVITIES_SUMMARY' });
    }
    if (heartZonesStatus === 'idle') {
      dispatch({ type: 'heartzones/FETCH_HEART_ZONES' });
    }
  }, [activitiesStatus, activitiesSummaryStatus, dispatch, heartZonesStatus, prefStatus]);

  return (<>{children}</>);
};

export default DataLayer;
