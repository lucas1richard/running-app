import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { selectActivity, selectActivityDetails, selectStreamTypeData } from '../reducers/activities';
import { selectApplicableHeartZone, selectAllHeartZones } from '../reducers/heartzones';
import HeartZonesDisplay from './HeartZonesDisplay';
import { convertMetricSpeedToMPH, getWeatherStyles } from '../utils';
import DurationDisplay from '../Common/DurationDisplay';
import GoogleMapImage from '../Common/GoogleMapImage';
import SegmentsDetailDisplay from './Segments';
import HeartZonesChartContainer from './HeartZonesChart';
import UpdatableNameDescription from './UpdatableNameDescription';
import SimilarWorkouts from './SimilarWorkouts';
import ReactMap from '../ReactMap';
import DetailDataFetcher, { streamTypes } from './DetailDataFetcher';
import Laps from './Laps';
import WeatherReporter from './WeatherReporter';
import { selectPreferencesZonesId } from '../reducers/preferences';
import PreferenceControl from '../PreferenceControl';
import usePreferenceControl from '../hooks/usePreferenceControl';
import { getDataNotReady, useTriggerActionIfStatus } from '../reducers/apiStatus';
import { triggerFetchActivityDetail, triggerFetchActivityStreamData } from '../reducers/activities-actions';
import { setActivityPrefsAct, triggerFetchActivityPrefs } from '../reducers/preferences-actions';
import {
  activityShouldShowLaps,
  activityShouldShowSegments,
  activityShouldShowSimilarWorkouts,
} from '../PreferenceControl/keyPaths';
import BestEfforts from './BestEfforts';
import calcEfficiencyFactor from '../utils/calcEfficiencyFactor';
import { emptyArray } from '../constants';
import { useAppSelector } from '../hooks/redux';
import Shimmer from '../Loading/Shimmer';
import { Grid } from '../DLS';

const ActivityDetailPage = () => {
  const dispatch = useDispatch();
  const { id: idString } = useParams();
  const id = Number(idString);
  const isLoading = [
    useTriggerActionIfStatus(triggerFetchActivityStreamData(id, streamTypes)),
    useTriggerActionIfStatus(triggerFetchActivityDetail(id)),
    useTriggerActionIfStatus(triggerFetchActivityPrefs(id)),
  ].some(getDataNotReady);

  const heartRateStream = useAppSelector((state) => selectStreamTypeData(state, id, 'heartrate'));
  const velocityStream = useAppSelector((state) => selectStreamTypeData(state, id, 'velocity_smooth'));
  const activity = useAppSelector((state) => selectActivity(state, id));
  const [showMap, setShowMap] = useState(false);

  const [
    tileBgColor, setTileBgColor, savePreferences
  ] = usePreferenceControl(['activities', idString, 'tileBackgroundIndicator']);
  const [shouldShowLaps] = usePreferenceControl(activityShouldShowLaps(idString));
  const [shouldShowSegments] = usePreferenceControl(activityShouldShowSegments(idString));
  const [shouldShowSimilar] = usePreferenceControl(activityShouldShowSimilarWorkouts(idString));
  const saveConfig = useMemo(() => ({ activityId: id }), [id]);
  

  const configZonesId = useAppSelector(selectPreferencesZonesId);
  const allZones = useAppSelector(selectAllHeartZones);
  const nativeZones = useAppSelector((state) => selectApplicableHeartZone(state, activity?.start_date));
  const zonesId = configZonesId === -1 ? nativeZones.id : configZonesId;
  const zones = allZones.find(({ id }) => id === zonesId) || nativeZones;

  const details = useAppSelector((state) => selectActivityDetails(state, id));

  const { backgroundColor } = getWeatherStyles(activity?.weather);

  if (isLoading) {
    return (
      <div className="pad">
        <Shimmer />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="pad">
        <h1>Activity Not Found</h1>
      </div>
    );
  }

  const {
    start_date_local,
    distance_miles,
    elapsed_time,
    average_seconds_per_mile,
    average_speed,
    average_heartrate,
    max_heartrate,
  } = activity;

  return (
    <Grid className={`pad`} gap="1rem">
      <DetailDataFetcher id={id} />
      <Grid templateColumns='1fr' gap='1rem' templateColumnsLg='1fr 1fr' templateColumnsXl='1fr 1fr'>
        <GoogleMapImage
          activityId={id}
          polyline={details?.map?.polyline}
          imgHeight={600}
          imgWidth={1200}
          height={600}
          width={'100%'}
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
              <span>{start_date_local ? dayjs(start_date_local).format('MMMM DD, YYYY') : ''}</span>
            </h2>
            <h3 className="text-center">
              {start_date_local ? dayjs.utc(start_date_local).format('h:mm A') : ''}
            </h3>
            <div className="text-center margin-tb">
              <h3>
                <strong>{distance_miles}</strong> miles in <strong><DurationDisplay numSeconds={elapsed_time} /></strong>
              </h3>
              <div className="flex flex-justify-between">
                <div className="margin-t">
                  <div className="heading-2">
                    <DurationDisplay numSeconds={average_seconds_per_mile} /><small>/mi</small>
                  </div>
                  <div className="heading-4">
                    {convertMetricSpeedToMPH(average_speed).toFixed(2)} mph
                  </div>
                </div>
                <div className="margin-t">
                  <div className="heading-2">
                    {Math.round(average_heartrate)} bpm
                  </div>
                  <div className="heading-4">
                    Max {max_heartrate} bpm
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center dls-blue">
              <div className="heading-5">
                Efficiency Factor
              </div>
              <div className="heading-2">
                {calcEfficiencyFactor(average_speed, average_heartrate).toFixed(2)}
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
      </Grid>

      <HeartZonesDisplay
        zones={zones}
        nativeZones={nativeZones}
        heartData={heartRateStream}
        velocityData={velocityStream}
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
        keyPath={activityShouldShowLaps(idString)}
        saveConfig={saveConfig}
      >
        <Grid templateColumns='1fr' gap='1rem' templateColumnsLg='auto 1fr' templateColumnsXl='auto 1fr'>
          <Laps id={id} />
          <BestEfforts bestEfforts={activity.bestEfforts} />
        </Grid>
      </PreferenceControl>

      <PreferenceControl
        subject="Segments"
        keyPath={activityShouldShowSegments(idString)}
        saveConfig={saveConfig}
      >
        <SegmentsDetailDisplay
          heartData={heartRateStream}
          velocityData={velocityStream}
          segments={details?.segment_efforts || emptyArray}
        />
      </PreferenceControl>

      <PreferenceControl
        subject="Similar Workouts"
        keyPath={activityShouldShowSimilarWorkouts(idString)}
        saveConfig={saveConfig}
      >
        <SimilarWorkouts
          activity={activity}
          zones={zones}
        />
      </PreferenceControl>
      <div>
        <button onClick={() => {
          dispatch(setActivityPrefsAct(
            'default',
            { shouldShowSimilar, shouldShowSegments, shouldShowLaps }
          ));
          savePreferences();
        }}>
          Save Preferences as a General Rule
        </button>
        <button onClick={() => savePreferences(saveConfig)}>
          Save Preferences For This Activity Only
        </button>
      </div>
    </Grid>
  );
};

export default ActivityDetailPage;
