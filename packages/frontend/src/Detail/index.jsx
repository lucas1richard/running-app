import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { makeSelectActivity, makeSelectStreamType } from '../reducers/activities';
import HeartRateChart from './HeartRateChart';

const ActivityDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const heartRateStream = useSelector(makeSelectStreamType(id, 'heartrate'));
  const velocityStream = useSelector(makeSelectStreamType(id, 'velocity_smooth'));
  const activity = useSelector(makeSelectActivity(id)) || {};

  console.log(velocityStream);

  useEffect(() => {
    dispatch({ type: 'activities/FETCH_STREAM_DATA', id });
  }, [dispatch, id]);
  
  return (
    <div>
      <h1>{activity.name}</h1>
      <h2>{activity.start_date_local ? dayjs(activity.start_date_local).format('MMMM DD, YYYY') : ''}</h2>
      {heartRateStream && (
        <div>
          <HeartRateChart data={heartRateStream.data} velocity={velocityStream?.data} />
          <HeartRateChart
            data={heartRateStream.data.slice(0, 60 * 4 * 6)}
            velocity={velocityStream?.data?.slice(9, 60 * 4 * 6)}
          />
        </div>
      )}
    </div>
  );
};

export default ActivityDetailPage;
