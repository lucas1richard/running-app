import React from 'react';
import { useSelector } from 'react-redux';
import { selectActivities } from '../reducers/activities';
import Tile from './Tile';

const Activities = () => {
  const activities = useSelector(selectActivities, (a, b) => a.length === b.length);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', }}>
      {activities.filter(({ sport_type }) => sport_type === 'Run').map((activity) => (
        <Tile key={activity.id} activity={activity} />
      ))}
    </div>
  );
};

export default Activities;
