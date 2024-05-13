import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { makeSelectActivity, makeSelectActivityDetails, makeSelectStreamType } from '../reducers/activities';
import { makeSelectApplicableHeartZone } from '../reducers/heartszones';
import HeartZonesDisplay from './HeartZonesDisplay';
import { convertHeartDataToZoneSpeeds, convertMetersToMiles, convertMetricSpeedToMPH } from '../utils';
import DurationDisplay from '../Common/DurationDisplay';
import GoogleMapImage from '../Common/GoogleMapImage';
import HeartZonesChart from './HeartZonesChart';
import ElevationChart from './ElevationChart';

const ActivityDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const heartRateStream = useSelector(makeSelectStreamType(id, 'heartrate'));
  const velocityStream = useSelector(makeSelectStreamType(id, 'velocity_smooth'));
  const gradeStream = useSelector(makeSelectStreamType(id, 'altitude'));
  const activity = useSelector(makeSelectActivity(id)) || {};
  const zones = useSelector(makeSelectApplicableHeartZone(activity.start_date_local));
  const details = useSelector(makeSelectActivityDetails(id));


  useEffect(() => {
    dispatch({ type: 'activities/FETCH_STREAM_DATA', id });
    dispatch({ type: 'activities/FETCH_ACTIVITY_DETAIL', id });
  }, [dispatch, id]);
  
  return (
    <div className="pad">
      {details && (
        <div className="text-center">
          <GoogleMapImage
            polyline={details.map.polyline}
            alt="route"
          />
        </div>
      )}
      <h1 className="text-center">{activity.name}</h1>
      <h2 className="text-center">{activity.start_date_local ? dayjs(activity.start_date_local).format('MMMM DD, YYYY') : ''}</h2>
      <div className="text-center margin-tb">
        <div>
          <strong>{convertMetersToMiles(activity.distance).toFixed(2)}</strong> miles in <strong><DurationDisplay numSeconds={activity.elapsed_time}/></strong>
        </div>
        <div>
          Avg Speed - {convertMetricSpeedToMPH(activity.average_speed).toFixed(2)} mph
        </div>
        <div>
          Avg Pace - <DurationDisplay numSeconds={Math.floor((3660 / convertMetricSpeedToMPH(activity.average_speed)))} />/mi
        </div>
        <div>
          Avg HR - {(activity.average_heartrate)} bpm (max {activity.max_heartrate} bpm)
        </div>
      </div>

      <HeartZonesDisplay
        zones={zones}
        heartData={heartRateStream?.data}
        velocityData={velocityStream?.data}
      />


      {heartRateStream && (
        <div>
          <HeartZonesChart
            data={heartRateStream.data}
            velocity={velocityStream?.data}
            zones={zones}
          />
          <ElevationChart
            data={heartRateStream.data}
            velocity={velocityStream?.data}
            grade={gradeStream?.data}
            zones={zones}
          />
          {/* <HeartRateChart
            data={heartRateStream.data.slice(0, 60 * 4 * 6)}
            velocity={velocityStream?.data?.slice(9, 60 * 4 * 6)}
            grade={gradeStream?.data?.slice(9, 60 * 4 * 6)}
            zones={zones}
            title="First 24 Min"
          /> */}
        </div>
      )}
    </div>
  );
};

export default ActivityDetailPage;
