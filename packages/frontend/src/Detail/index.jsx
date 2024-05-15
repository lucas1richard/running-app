import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { makeSelectActivity, makeSelectActivityDetails, makeSelectStreamType } from '../reducers/activities';
import { makeSelectApplicableHeartZone } from '../reducers/heartszones';
import HeartZonesDisplay from './HeartZonesDisplay';
import { convertMetersToMiles, convertMetricSpeedToMPH, longestCommonSubString } from '../utils';
import DurationDisplay from '../Common/DurationDisplay';
import GoogleMapImage from '../Common/GoogleMapImage';
import HeartZonesChart from './HeartZonesChart';
import ElevationChart from './ElevationChart';
import SegmentsDetailDisplay from './Segments';

const ActivityDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const heartRateStream = useSelector(makeSelectStreamType(id, 'heartrate'));
  const velocityStream = useSelector(makeSelectStreamType(id, 'velocity_smooth'));
  const gradeStream = useSelector(makeSelectStreamType(id, 'altitude'));
  const activity = useSelector(makeSelectActivity(id)) || {};
  const zones = useSelector(makeSelectApplicableHeartZone(activity.start_date_local));
  const details = useSelector(makeSelectActivityDetails(id));
  const comparisonDetails = useSelector(makeSelectActivityDetails(11173828695));

  const matchingSegmentIndexes = useMemo(() => longestCommonSubString(
    details?.segment_efforts || [],
    comparisonDetails?.segment_efforts || [],
    { getXVal: (val) => val.name, getYVal: (val) => val.name}
  ), [comparisonDetails?.segment_efforts, details?.segment_efforts]);


  useEffect(() => {
    dispatch({ type: 'activities/FETCH_STREAM_DATA', id });
    dispatch({ type: 'activities/FETCH_ACTIVITY_DETAIL', payload: id });
    dispatch({ type: 'activities/FETCH_ACTIVITY_DETAIL', payload: 11173828695 });
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
        </div>
      )}

      {details && (
        <SegmentsDetailDisplay
          heartData={heartRateStream?.data}
          velocityData={velocityStream?.data}
          segments={details.segment_efforts}
        />
      )}
      {
        details && comparisonDetails && (
          <div>
            {matchingSegmentIndexes.map((ix) => (
              <div key={ix}>{comparisonDetails.segment_efforts[ix].name}</div>
            ))}
          </div>
        )
      }
    </div>
  );
};

export default ActivityDetailPage;
