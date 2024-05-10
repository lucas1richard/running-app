import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GOOGLE_API_KEY } from '../constants';
import dayjs from 'dayjs';
import { selectActivities } from '../reducers/activities';

const Activities = () => {
  const dispatch = useDispatch();
  const activities = useSelector(selectActivities);

  useEffect(() => {
    dispatch({ type: 'activities/FETCH_ACTIVITIES' });
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
      {activities.map((activity) => (
        <div key={activity.id} style={{ padding: '10px', display: 'flex' }}>
          <img
            src={`https://maps.googleapis.com/maps/api/staticmap?size=600x300&maptype=roadmap&path=enc:${activity.map.summary_polyline}&key=${GOOGLE_API_KEY}`}
            alt="summary route"
            style={{ width: '200px', marginRight: '10px' }}
          />
          <div>
            <div>
              {dayjs(activity.start_date_local).format('MMMM DD, YYYY')}
            </div>
            <div>
              <h2>{activity.name}</h2>
            </div>
            <div>
              {activity.sport_type} - {(activity.distance / 1609).toFixed(2)} miles
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Activities;
