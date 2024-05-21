import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { selectActivity, selectActivityDetails, selectStreamType } from '../reducers/activities';
import { makeSelectApplicableHeartZone, selectAllHeartZones } from '../reducers/heartszones';
import HeartZonesDisplay from './HeartZonesDisplay';
import { convertHeartDataToZoneTimes, convertMetersToMiles, convertMetricSpeedToMPH } from '../utils';
import DurationDisplay from '../Common/DurationDisplay';
import GoogleMapImage from '../Common/GoogleMapImage';
import SegmentsDetailDisplay from './Segments';
import HeartZonesChartContainer from './HeartZonesChart';
import { selectConfigZonesId } from '../reducers/config';
import UpdatableNameDescription from './UpdatableNameDescription';
import requestor from '../utils/requestor';
import SimilarWorkouts from './SimilarWorkouts';
import ReactMap from '../ReactMap';

const ActivityDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const heartRateStream = useSelector((state) => selectStreamType(state, id, 'heartrate'));
  const velocityStream = useSelector((state) => selectStreamType(state, id, 'velocity_smooth'));
  // const gradeStream = useSelector((state) => selectStreamType(state, id, 'altitude'));
  const activity = useSelector((state) => selectActivity(state, id)) || {};
  const [showMap, setShowMap] = useState(false);

  const configZonesId = useSelector(selectConfigZonesId);
  const allZones = useSelector(selectAllHeartZones);
  const nativeZones = useSelector((state) => makeSelectApplicableHeartZone(state, activity.start_date));
  const zonesId = configZonesId === -1 ? nativeZones.id : configZonesId;
  const zones = allZones.find(({ id }) => id === zonesId) || nativeZones;

  const details = useSelector((state) => selectActivityDetails(state, id));

  useEffect(() => {
    dispatch({ type: 'activities/FETCH_STREAM_DATA', id });
    dispatch({ type: 'activities/FETCH_ACTIVITY_DETAIL', payload: id });
  }, [dispatch, id]);

  useEffect(() => {
    if (!zones || !heartRateStream?.data) return;

    if (convertHeartDataToZoneTimes(heartRateStream.data, zones).filter(Boolean).length === 0) return;

    requestor.post('/heartzones/set-cache', {
      times: convertHeartDataToZoneTimes(heartRateStream.data, zones),
      id: activity.id,
      zonesId: zones.id,
    });
  }, [activity.id, heartRateStream, id, zones.id]);

  return (
    <div className="pad">
      {details && (
        <div className="text-center">
          <GoogleMapImage
            activityId={id}
            polyline={details.map.polyline}
            imgHeight={600}
            imgWidth={1200}
            alt="route"
          />
        </div>
      )}
      <div className="flex flex-column flex-align-center">
        {!showMap && <button onClick={() => setShowMap(true)}>Show Map</button>}
        {showMap && (
          <div style={{ height: 600, width: 600 }}>
            <ReactMap id={id} />
          </div>
        )}
      </div>
      <UpdatableNameDescription
        activity={activity}
        details={details}
      />
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
        nativeZones={nativeZones}
        heartData={heartRateStream?.data}
        velocityData={velocityStream?.data}
      />


      {heartRateStream && (
        <div>
          <HeartZonesChartContainer id={id} />
          {/* <ElevationChart
            data={heartRateStream.data}
            velocity={velocityStream?.data}
            grade={gradeStream?.data}
            zones={zones}
          /> */}
        </div>
      )}

      {details && (
        <SegmentsDetailDisplay
          heartData={heartRateStream?.data}
          velocityData={velocityStream?.data}
          segments={details.segment_efforts}
        />
      )}

      <SimilarWorkouts
        activity={activity}
        zones={zones}
      />
    </div>
  );
};

export default ActivityDetailPage;
