import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const DataLayer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: 'preferences/FETCH_USER_PREFERENCES' });
    dispatch({ type: 'activities/FETCH_ACTIVITIES' });
    dispatch({ type: 'activities/FETCH_ACTIVITIES_SUMMARY' });
    dispatch({ type: 'heartzones/FETCH_HEART_ZONES' });
  }, [dispatch]);

  return (<>{children}</>);
};

export default DataLayer;
