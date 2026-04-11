import DurationDisplay from '@/Common/DurationDisplay';
import MapLibreHRZones from '@/Common/MapLibreHRZones';
import { Basic as B, Button, Flex, Grid } from '@/DLS';
import Surface from '@/DLS/Surface';
import BestEfforts from '@/Detail/BestEfforts';
import DetailDataFetcher, { streamTypes } from '@/Detail/DetailDataFetcher';
import HeartZonesChartContainer from '@/Detail/HeartZonesChart';
import HeartZonesDisplay from '@/Detail/HeartZonesDisplay';
import Laps from '@/Detail/Laps';
import SplitsKm from '@/Detail/Laps/SplitKm';
import SplitsMi from '@/Detail/Laps/SplitsMi';
import SegmentsDetailDisplay from '@/Detail/Segments';
import SimilarWorkouts from '@/Detail/SimilarWorkouts';
import UpdatableNameDescription from '@/Detail/UpdatableNameDescription';
import WeatherReporter from '@/Detail/WeatherReporter';
import Shimmer from '@/Loading/Shimmer';
import PreferenceControl from '@/PreferenceControl';
import {
  activityShouldShowLaps,
  activityShouldShowSegments,
  activityShouldShowSimilarWorkouts,
} from '@/PreferenceControl/keyPaths';
import { emptyArray } from '@/constants';
import { useAppSelector } from '@/hooks/redux';
import usePreferenceControl from '@/hooks/usePreferenceControl';
import { selectActivity, selectActivityDetails, selectStreamTypeData } from '@/reducers/activities';
import { triggerFetchActivityDetail, triggerFetchActivityStreamData } from '@/reducers/activities-actions';
import { getDataNotReady, useTriggerActionIfStatus } from '@/reducers/apiStatus';
import { selectAllHeartZones, selectApplicableHeartZone } from '@/reducers/heartzones';
import { selectPreferencesZonesId } from '@/reducers/preferences';
import { setActivityPrefsAct, triggerFetchActivityPrefs } from '@/reducers/preferences-actions';
import { convertMetricSpeedToMPH } from '@/utils';
import calcEfficiencyFactor from '@/utils/calcEfficiencyFactor';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

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

  const [
    savePreferences
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

  if (isLoading) {
    return (
      <B.Div $pad={1}>
        <Shimmer />
      </B.Div>
    );
  }

  if (!activity) {
    return (
      <B.Div $pad={1}>
        <h1>Activity Not Found</h1>
      </B.Div>
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
    <Grid $pad={1} $gap={1}>
      <DetailDataFetcher id={id} />
      <Grid $templateColumns='1fr' $gap={1} $templateColumnsLgUp='1fr 1fr'>
        <B.Div $height="600px" $display='flex'>
          <MapLibreHRZones id={id} animated={true} />
          <B.Div $widthSmDown={2} $height="100%" $colorBg="black" />
        </B.Div>
        <Surface>
          <div className={`$pad border-radius-1`}>
            <UpdatableNameDescription
              activity={activity}
              details={details}
            />
            <B.Div $fontSize="h2" $textAlign="center" $marginT={2}>
              {start_date_local ? dayjs(start_date_local).format('MMMM DD, YYYY') : ''}
            </B.Div>
            <B.Div $fontSize="h4" $textAlign="center">
              {start_date_local ? dayjs.utc(start_date_local).format('h:mm A') : ''}
            </B.Div>
            <B.Div $textAlign="center" $marginT={1} $marginB={1}>
              <h3>
                <strong>{distance_miles}</strong> miles in <strong><DurationDisplay numSeconds={elapsed_time} /></strong>
              </h3>
              <Flex $directionSmDown="column" $gap={1} $justifyMdUp="space-between">
                <B.Div $marginT={1}>
                  <B.Div $fontSize="h2">
                    <DurationDisplay numSeconds={average_seconds_per_mile} /><small>/mi</small>
                  </B.Div>
                  <B.Div $fontSize="h4">
                    {convertMetricSpeedToMPH(average_speed).toFixed(2)} mph
                  </B.Div>
                </B.Div>
                <B.Div $marginT={1}>
                  <B.Div $fontSize="h2">
                    {Math.round(average_heartrate)} bpm
                  </B.Div>
                  <B.Div $fontSize="h4">
                    Max {max_heartrate} bpm
                  </B.Div>
                </B.Div>
              </Flex>
            </B.Div>
            <div className="text-center text-efficiencyFactor">
              <B.Div $fontSize="h5">
                Efficiency Factor
              </B.Div>
              <B.Div $fontSize="h2">
                {calcEfficiencyFactor(average_speed, average_heartrate).toFixed(2)}
              </B.Div>
              <div>
                yards per beat
              </div>
            </div>
            <div>
              <WeatherReporter id={id} />
            </div>
          </div>
        </Surface>
      </Grid>

      <HeartZonesDisplay
        zones={zones}
        nativeZones={nativeZones}
        heartData={heartRateStream}
        velocityData={velocityStream}
      />

      <HeartZonesChartContainer id={id} />

      <PreferenceControl
        subject="Laps & Best Efforts"
        keyPath={activityShouldShowLaps(idString)}
        saveConfig={saveConfig}
      >
        <Grid $templateColumns='1fr' $gap={1} $templateColumnsLgUp='auto auto auto 1fr'>
          <Laps id={id} />
          <SplitsMi id={id} />
          <SplitsKm id={id} />
          <BestEfforts bestEfforts={activity.calculatedBestEfforts} />
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
        <Button onClick={() => {
          dispatch(setActivityPrefsAct(
            'default',
            { shouldShowSimilar, shouldShowSegments, shouldShowLaps }
          ));
          savePreferences();
        }}>
          Save Preferences as a General Rule
        </Button>
        <Button onClick={() => savePreferences(saveConfig)}>
          Save Preferences For This Activity Only
        </Button>
      </div>
    </Grid>
  );
};

export default ActivityDetailPage;
