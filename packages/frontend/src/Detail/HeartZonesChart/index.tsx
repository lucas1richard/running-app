import HeartZonesChartDisplay from './HeartZonesChartDisplay';
import { selectActivity, selectActivityDetails, selectStreamTypeData } from '../../reducers/activities';
import { selectHeartZones } from '../../reducers/heartzones';
import usePreferenceControl from '../../hooks/usePreferenceControl';
import { emptyArray } from '../../constants';
import { useAppSelector } from '../../hooks/redux';

const HeartZonesChartContainer = ({ id }) => {
  const activity = useAppSelector((state) => selectActivity(state, id));
  const heartRateStream = useAppSelector((state) => selectStreamTypeData(state, id, 'heartrate'));
  const velocityStream = useAppSelector((state) => selectStreamTypeData(state, id, 'velocity_smooth'));
  const altitudeStream = useAppSelector((state) => selectStreamTypeData(state, id, 'altitude'));
  const timeStream = useAppSelector((state) => selectStreamTypeData(state, id, 'time'));
  const gradeStream = useAppSelector((state) => selectStreamTypeData(state, id, 'grade_smooth'));
  const zones = useAppSelector((state) => selectHeartZones(state, activity?.start_date));
  const details = useAppSelector((state) => selectActivityDetails(state, id));
  const bestEfforts = details?.best_efforts || emptyArray;
  const laps = details?.laps || emptyArray;
  const splitsMi = details?.splits_standard || emptyArray;

  const [
    zonesBandsDirection,
    setZonesBandsDirection,
    savePreferences,
  ] = usePreferenceControl<'xAxis' | 'yAxis' | 'none'>(
    ['activities', id, 'zonesBandsDirection'],
    'xAxis'
  );

  return (
    <div>
      <HeartZonesChartDisplay
        id={id}
        averageSpeed={activity.average_speed}
        data={heartRateStream}
        velocity={velocityStream}
        altitude={altitudeStream}
        grade={gradeStream}
        time={timeStream}
        zones={zones}
        zonesBandsDirection={zonesBandsDirection}
        laps={laps}
        bestEfforts={bestEfforts}
        splitsMi={splitsMi}
      />
      <form onSubmit={(ev) => ev.preventDefault()}>
        <label>
          <input
            type="radio"
            value="xAxis"
            checked={zonesBandsDirection === 'xAxis'}
            onChange={(e) => setZonesBandsDirection('xAxis')}
          />
          xAxis
        </label>
        <label>
          <input
            type="radio"
            value="yAxis"
            checked={zonesBandsDirection === 'yAxis'}
            onChange={(e) => setZonesBandsDirection('yAxis')}
          />
          yAxis
        </label>
        <label>
          <input
            type="radio"
            value="none"
            checked={zonesBandsDirection === 'none'}
            onChange={(e) => setZonesBandsDirection('none')}
          />
          None
        </label>
        <button type="button" onClick={() => savePreferences({ activityId: id })}>Save</button>
      </form>
    </div>
  );
};

export default HeartZonesChartContainer;
