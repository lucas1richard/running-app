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
import UpdatableNameDescription from './UpdatableNameDescription';
import SimilarWorkouts from './SimilarWorkouts';
import ReactMap from '../ReactMap';
import DetailDataFetcher from './DetailDataFetcher';
import Laps from './Laps';
import WeatherReporter from './WeatherReporter';
import { selectPreferencesZonesId } from '../reducers/preferences';
import PreferenceControl from '../PreferenceControl';
import usePreferenceControl from '../hooks/usePreferenceControl';
import FlexibleChart from './FlexibleChart';
import { useGetApiStatus } from '../reducers/apiStatus';
import ActivityNetworkChart from '../ActivityNetwork';

const roundCoords = (coords, byNum = 5000) => coords.map(([lat, lng]) => [Math.round(lng * byNum) / byNum, Math.round(lat * byNum) / byNum]);
const compressCoords = (coords) => {
  const compressed = [coords[0]];
  for (let i = 1; i < coords.length; i++) {
    if (coords[i][0] !== coords[i - 1][0] || coords[i][1] !== coords[i - 1][1]) {
      compressed.push(coords[i]);
    }
  }
  return compressed;
};

const ActivityDetailPage = () => {
  const { id } = useParams();
  const apiStatus = useGetApiStatus(`activities/FETCH_ACTIVITY_DETAIL-${id}`);
  const heartRateStream = useSelector((state) => selectStreamType(state, id, 'heartrate'));
  const velocityStream = useSelector((state) => selectStreamType(state, id, 'velocity_smooth'));
  const activity = useSelector((state) => selectActivity(state, id)) || {};
  const [showMap, setShowMap] = useState(false);
  const { data: latlngStreamData = [] } = useSelector((state) => selectStreamType(state, id, 'latlng')) || {};

  const configZonesId = useSelector(selectPreferencesZonesId);
  const allZones = useSelector(selectAllHeartZones);
  const nativeZones = useSelector((state) => makeSelectApplicableHeartZone(state, activity.start_date));
  const zonesId = configZonesId === -1 ? nativeZones.id : configZonesId;
  const zones = allZones.find(({ id }) => id === zonesId) || nativeZones;
  const [tileBgColor, setTileBgColor, savePreferences] = usePreferenceControl(['activities', id, 'tileBackgroundIndicator']);

  const details = useSelector((state) => selectActivityDetails(state, id));

  const { backgroundColor } = getWeatherStyles(activity.weather || {});

  const isLoading = (apiStatus === 'idle' || apiStatus === 'loading');

  return (
    <div className={`pad`}>
      <DetailDataFetcher id={id} />
      {isLoading && <div>Loading...</div>}
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
          <div className={`pad ${tileBgColor === 'weather' && backgroundColor} border-radius-1`}>
            <button onClick={() => setTileBgColor('weather')}>Show Weather Background</button>
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
                Avg Pace - <DurationDisplay numSeconds={activity.average_seconds_per_mile} />/mi
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

      <FlexibleChart data={compressCoords(roundCoords(latlngStreamData))} width={600} />

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

      <PreferenceControl
        subject="Laps"
        keyPath={['activities', id, 'shouldShowLaps']}
        saveConfig={{ activityId: id }}
      >
        <Laps id={id} />
      </PreferenceControl>

      {/* <ElevationChart
        data={heartRateStream.data}
        velocity={velocityStream?.data}
        grade={gradeStream?.data}
        zones={zones}
      /> */}

      <PreferenceControl
        subject="Segments"
        keyPath={['activities', id, 'shouldShowSegments']}
        saveConfig={{ activityId: id }}
      >
        <SegmentsDetailDisplay
          heartData={heartRateStream?.data}
          velocityData={velocityStream?.data}
          segments={details?.segment_efforts || []}
        />
      </PreferenceControl>

      <PreferenceControl
        subject="Similar Workouts"
        keyPath={['activities', id, 'shouldShowSimilar']}
        saveConfig={{ activityId: id }}
      >
        <SimilarWorkouts
          activity={activity}
          zones={zones}
        />
      </PreferenceControl>

      <ActivityNetworkChart />
      <div>
        <button onClick={savePreferences}>
          Save Preferences as a General Rule
        </button>
        <button onClick={() => savePreferences({ activityId: id })}>
          Save Preferences For This Activity Only
        </button>
      </div>
    </div>
  );
};

export default ActivityDetailPage;
