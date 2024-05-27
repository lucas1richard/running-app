import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { selectActivity, selectActivityDetails, selectStreamType } from '../reducers/activities';
import { makeSelectApplicableHeartZone, selectAllHeartZones } from '../reducers/heartszones';
import HeartZonesDisplay from './HeartZonesDisplay';
import { convertMetersToMiles, convertMetricSpeedToMPH, getWeatherStyles } from '../utils';
import DurationDisplay from '../Common/DurationDisplay';
import GoogleMapImage from '../Common/GoogleMapImage';
import SegmentsDetailDisplay from './Segments';
import HeartZonesChartContainer from './HeartZonesChart';
import { selectConfigZonesId } from '../reducers/config';
import UpdatableNameDescription from './UpdatableNameDescription';
import SimilarWorkouts from './SimilarWorkouts';
import ReactMap from '../ReactMap';
import DetailDataFetcher from './DetailDataFetcher';
import Laps from './Laps';
import WeatherReporter from './WeatherReporter';

const ActivityDetailPage = () => {
  const { id } = useParams();

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

  const { backgroundColor } = getWeatherStyles(activity.weather || {});

  return (
    <div className={`pad`}>
      <DetailDataFetcher id={id} />
      <div className="flex flex-justify-center gap margin-b">
        <GoogleMapImage
          activityId={id}
          polyline={details?.map?.polyline}
          imgHeight={600}
          imgWidth={1200}
          height={600}
          width={600}
          alt="route"
        />
        <div className="border-radius-1" style={{ width: 600, background: '#fff', border: '1px solid black' }}>
          <div className={`pad ${backgroundColor} border-radius-1`}>
            <UpdatableNameDescription
              activity={activity}
              details={details}
            />
            <h2 className="text-center">
              {activity.start_date_local ? dayjs(activity.start_date_local).format('MMMM DD, YYYY') : ''}
            </h2>
            <h3 className="text-center">
              {activity.start_date_local ? dayjs.utc(activity.start_date_local).format('h:mm A') : ''}
            </h3>
            <div className="text-center margin-tb">
              <div>
                <strong>{convertMetersToMiles(activity.distance).toFixed(2)}</strong> miles in <strong><DurationDisplay numSeconds={activity.elapsed_time} /></strong>
              </div>
              <div>
                Avg Speed - {convertMetricSpeedToMPH(activity.average_speed).toFixed(2)} mph
              </div>
              <div>
                Avg Pace - <DurationDisplay numSeconds={Math.floor((3660 / convertMetricSpeedToMPH(activity.average_speed)))} />/mi
              </div>
              <div>
                Avg HR - {Math.round(activity.average_heartrate)} bpm (max {activity.max_heartrate} bpm)
              </div>
            </div>
            <div>
              <WeatherReporter id={id} />
            </div>
          </div>
          </div>
      </div>

      <HeartZonesDisplay
        zones={zones}
        nativeZones={nativeZones}
        heartData={heartRateStream?.data}
        velocityData={velocityStream?.data}
      />

      <HeartZonesChartContainer id={id} />

      <div className="flex flex-column flex-align-center">
        {!showMap && <button onClick={() => setShowMap(true)}>Show Map</button>}
        {showMap && (
          <div style={{ height: 600, width: 600 }}>
            <ReactMap id={id} />
          </div>
        )}
      </div>

      <Laps id={id} />

      {/* <ElevationChart
        data={heartRateStream.data}
        velocity={velocityStream?.data}
        grade={gradeStream?.data}
        zones={zones}
      /> */}

        <SegmentsDetailDisplay
          heartData={heartRateStream?.data}
          velocityData={velocityStream?.data}
          segments={details?.segment_efforts || []}
        />

      {activity?.id && zones?.id && (
        <SimilarWorkouts
          activity={activity}
          zones={zones}
        />
      )}
    </div>
  );
};

export default ActivityDetailPage;
