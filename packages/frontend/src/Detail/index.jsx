import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { selectActivity, selectActivityDetails, selectStreamType } from '../reducers/activities';
import { makeSelectApplicableHeartZone, selectAllHeartZones } from '../reducers/heartzones';
import HeartZonesDisplay from './HeartZonesDisplay';
import { convertMetricSpeedToMPH, getWeatherStyles } from '../utils';
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
import { idle, loading, useTriggerActionIfStatus } from '../reducers/apiStatus';
import Spinner from '../Loading/Spinner';
import { triggerFetchActivityDetail, triggerFetchActivityStreamData } from '../reducers/activities-actions';
import { triggerFetchActivityPrefs } from '../reducers/preferences-actions';
import {
  activityShouldShowLaps,
  activityShouldShowSegments,
  activityShouldShowSimilarWorkouts,
} from '../PreferenceControl/keyPaths';
import BestEfforts from './BestEfforts';
import calcEfficiencyFactor from '../utils/calcEfficiencyFactor';

const ActivityDetailPage = () => {
  const { id } = useParams();
  const streamApiStatus = useTriggerActionIfStatus(triggerFetchActivityStreamData(id));
  const isLoading = [
    streamApiStatus,
    useTriggerActionIfStatus(triggerFetchActivityDetail(id)),
    useTriggerActionIfStatus(triggerFetchActivityPrefs(id)),
  ].some((apiStatus) => (apiStatus === idle || apiStatus === loading));

  const heartRateStream = useSelector((state) => selectStreamType(state, id, 'heartrate'));
  const velocityStream = useSelector((state) => selectStreamType(state, id, 'velocity_smooth'));
  const activity = useSelector((state) => selectActivity(state, id)) || {};
  const [showMap, setShowMap] = useState(false);

  const configZonesId = useSelector(selectPreferencesZonesId);
  const allZones = useSelector(selectAllHeartZones);
  const nativeZones = useSelector((state) => makeSelectApplicableHeartZone(state, activity.start_date));
  const zonesId = configZonesId === -1 ? nativeZones.id : configZonesId;
  const zones = allZones.find(({ id }) => id === zonesId) || nativeZones;
  const [tileBgColor, setTileBgColor, savePreferences] = usePreferenceControl(['activities', id, 'tileBackgroundIndicator']);

  const details = useSelector((state) => selectActivityDetails(state, id));

  const { backgroundColor } = getWeatherStyles(activity.weather || {});

  return (
    <div className={`pad`}>
      <DetailDataFetcher id={id} />
      {isLoading
        ? (
          <Spinner size="xlarge" />
        )
        : (
          <>
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
              <div className="card">
                <div className={`pad ${tileBgColor === 'weather' && backgroundColor} border-radius-1`}>
                  <button onClick={() => setTileBgColor('weather')}>Show Weather Background</button>
                  <UpdatableNameDescription
                    activity={activity}
                    details={details}
                  />
                  <h2 className="text-center margin-2-t">
                    <date>{activity.start_date_local ? dayjs(activity.start_date_local).format('MMMM DD, YYYY') : ''}</date>
                  </h2>
                  <h3 className="text-center">
                    {activity.start_date_local ? dayjs.utc(activity.start_date_local).format('h:mm A') : ''}
                  </h3>
                  <div className="text-center margin-tb">
                    <h3>
                      <strong>{activity.distance_miles}</strong> miles in <strong><DurationDisplay numSeconds={activity.elapsed_time} /></strong>
                    </h3>
                    <div className="flex flex-justify-between">
                      <div className="margin-t">
                        <div className="heading-2">
                          <DurationDisplay numSeconds={activity.average_seconds_per_mile} /><small>/mi</small>
                        </div>
                        <div className="heading-4">
                          {convertMetricSpeedToMPH(activity.average_speed).toFixed(2)} mph
                        </div>
                      </div>
                      <div className="margin-t">
                        <div className="heading-2">
                          {Math.round(activity.average_heartrate)} bpm
                        </div>
                        <div className="heading-4">
                          Max {activity.max_heartrate} bpm
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center dls-blue">
                    <div className="heading-5">
                      Efficiency Factor
                    </div>
                    <div className="heading-2">
                      {calcEfficiencyFactor(activity.average_speed, activity.average_heartrate).toFixed(2)}
                    </div>
                    <div>
                    yards per beat
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

            <PreferenceControl
              subject="Laps & Best Efforts"
              keyPath={activityShouldShowLaps(id)}
              saveConfig={{ activityId: id }}
            >
              <div className="flex gap">
                <Laps id={id} />
                <BestEfforts bestEfforts={details.best_efforts} />
              </div>
            </PreferenceControl>

            <PreferenceControl
              subject="Segments"
              keyPath={activityShouldShowSegments(id)}
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
              keyPath={activityShouldShowSimilarWorkouts(id)}
              saveConfig={{ activityId: id }}
            >
              <SimilarWorkouts
                activity={activity}
                zones={zones}
              />
            </PreferenceControl>
            <div>
              <button onClick={savePreferences}>
                Save Preferences as a General Rule
              </button>
              <button onClick={() => savePreferences({ activityId: id })}>
                Save Preferences For This Activity Only
              </button>
            </div>
          </>
        )}
    </div>
  );
};

export default ActivityDetailPage;
