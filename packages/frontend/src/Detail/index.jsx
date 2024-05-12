import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { makeSelectActivity, makeSelectStreamType } from '../reducers/activities';
import HeartRateChart from './HeartRateChart';
import { makeSelectApplicableHeartZone } from '../reducers/heartszones';
import HeartZonesDisplay from './HeartZonesDisplay';

const ActivityDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const heartRateStream = useSelector(makeSelectStreamType(id, 'heartrate'));
  const velocityStream = useSelector(makeSelectStreamType(id, 'velocity_smooth'));
  const gradeStream = useSelector(makeSelectStreamType(id, 'grade_smooth'));
  const activity = useSelector(makeSelectActivity(id)) || {};
  const zones = useSelector(makeSelectApplicableHeartZone(activity.start_date_local));

  useEffect(() => {
    dispatch({ type: 'activities/FETCH_STREAM_DATA', id });
  }, [dispatch, id]);
  
  return (
    <div>
      <h1 className="text-center">{activity.name}</h1>
      <h2 className="text-center">{activity.start_date_local ? dayjs(activity.start_date_local).format('MMMM DD, YYYY') : ''}</h2>

      <HeartZonesDisplay zones={zones} heartData={heartRateStream?.data} />

      {heartRateStream && (
        <div>
          <HeartRateChart
            data={heartRateStream.data}
            velocity={velocityStream?.data}
            grade={gradeStream?.data}
            zones={zones}
            title="Whole Activity"
          />
          <HeartRateChart
            data={heartRateStream.data.slice(0, 60 * 4 * 6)}
            velocity={velocityStream?.data?.slice(9, 60 * 4 * 6)}
            grade={gradeStream?.data?.slice(9, 60 * 4 * 6)}
            zones={zones}
            title="First 24 Min"
          />
        </div>
      )}
    </div>
  );
};

export default ActivityDetailPage;
