import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActivities } from '../reducers/activities';
import Tile from './Tile';

const Activities = () => {
  const dispatch = useDispatch();
  const activities = useSelector(selectActivities, (a, b) => a.length === b.length);
  const onClickSync = useCallback(() => {
    dispatch({ type: 'activities/FETCH_ACTIVITIES', forceFetch: true });
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', }}>
      <div>
        <button onClick={onClickSync}>Sync Strava</button>
      </div>
      {activities.filter(({ sport_type }) => sport_type === 'Run').map((activity) => (
        <Tile key={activity.id} activity={activity} />
      ))}
    </div>
  );
};

export default Activities;
