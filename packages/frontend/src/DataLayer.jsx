import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const DataLayer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: 'activities/FETCH_ACTIVITIES' });
    dispatch({ type: 'activities/FETCH_ACTIVITIES_SUMMARY' });
  }, [dispatch]);

  return (<>{children}</>);
};

export default DataLayer;