import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { makeSelectActivity, makeSelectActivityDetails, makeSelectStreamType } from '../reducers/activities';
import { makeSelectApplicableHeartZone, selectAllHeartZones } from '../reducers/heartszones';
import HeartZonesDisplay from './HeartZonesDisplay';
import { convertHeartDataToZoneTimes, convertMetersToMiles, convertMetricSpeedToMPH } from '../utils';
import DurationDisplay from '../Common/DurationDisplay';
import GoogleMapImage from '../Common/GoogleMapImage';
// import ElevationChart from './ElevationChart';
import SegmentsDetailDisplay from './Segments';
import Tile from '../Activities/Tile';
import HeartZonesChartContainer from './HeartZonesChart';
import { selectConfigZonesId } from '../reducers/config';

const ActivityDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [similarDist, setSimilarDist] = useState([]);

  const heartRateStream = useSelector(makeSelectStreamType(id, 'heartrate'));
  const velocityStream = useSelector(makeSelectStreamType(id, 'velocity_smooth'));
  // const gradeStream = useSelector(makeSelectStreamType(id, 'altitude'));
  const activity = useSelector(makeSelectActivity(id)) || {};

  const configZonesId = useSelector(selectConfigZonesId);
  const allZones = useSelector(selectAllHeartZones);
  const nativeZones = useSelector(makeSelectApplicableHeartZone(activity.start_date));
  const zonesId = configZonesId === -1 ? nativeZones.id : configZonesId;
  const zones = allZones.find(({ id }) => id === zonesId) || nativeZones;

  const details = useSelector(makeSelectActivityDetails(id));

  useEffect(() => {
    dispatch({ type: 'activities/FETCH_STREAM_DATA', id });
    dispatch({ type: 'activities/FETCH_ACTIVITY_DETAIL', payload: id });
    dispatch({ type: 'activities/FETCH_ACTIVITY_DETAIL', payload: 11173828695 });
    fetch(
      'http://localhost:3001/analysis/similar-workouts/by-route',
      {
        method: 'POST',
        body: JSON.stringify({ id }),
        headers: { 'Content-Type': 'application/json' },
      }
    ).then((res) => res.json())
      .then(({ combo }) => setSimilarDist(combo))
      .catch(console.log);
  }, [dispatch, id]);


  useEffect(() => {
    if (!zones || !heartRateStream?.data) return;

    fetch('http://localhost:3001/heartzones/set-cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        times: convertHeartDataToZoneTimes(heartRateStream.data, zones),
        id: activity.id,
        zonesId: zones.id,
      }),
    })
  }, [activity.id, heartRateStream, id, zones]);
  
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

      <h2>Similar Runs</h2>
      {similarDist.map((activity) => <Tile key={activity.id} activity={activity} zones={zones} />)}
    </div>
  );
};

export default ActivityDetailPage;
