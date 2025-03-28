import { useMemo } from 'react';
import HeartZonesChartDisplay from './HeartZonesChartDisplay';
import { selectActivity, selectActivityDetails, selectStreamTypeData } from '../../reducers/activities';
import { selectHeartZones } from '../../reducers/heartzones';
import usePreferenceControl from '../../hooks/usePreferenceControl';
import { emptyArray } from '../../constants';
import { useAppSelector } from '../../hooks/redux';
import { Basic, Button } from '../../DLS';
import HeatMapMapLibre from '../../Common/HeatMapMapLibre';

const HeartZonesChartContainer = ({ id }) => {
  const activity = useAppSelector((state) => selectActivity(state, id));
  const heartRateStream = useAppSelector((state) => selectStreamTypeData(state, id, 'heartrate'));
  const velocityStream = useAppSelector((state) => selectStreamTypeData(state, id, 'velocity_smooth'));
  const altitudeStream = useAppSelector((state) => selectStreamTypeData(state, id, 'altitude'));
  const timeStream = useAppSelector((state) => selectStreamTypeData(state, id, 'time'));
  const gradeStream = useAppSelector((state) => selectStreamTypeData(state, id, 'grade_smooth'));
  const latlngStream = useAppSelector((state) => selectStreamTypeData(state, id, 'latlng'));
  const zones = useAppSelector((state) => selectHeartZones(state, activity?.start_date));
  const details = useAppSelector((state) => selectActivityDetails(state, id));
  const streamPins = activity?.stream_pins || emptyArray;
  const bestEfforts = details?.best_efforts || emptyArray;
  const laps = details?.laps || emptyArray;
  const splitsMi = details?.splits_standard || emptyArray;

  const hrHeatMapData = useMemo(() => heartRateStream.map((v, ix) => ({
    lat: latlngStream[ix]?.[0] || 0,
    lon: latlngStream[ix]?.[1] || 0,
    measure: v
  })).slice(20, heartRateStream.length - 20), [heartRateStream, latlngStream]);

  const altitudeHeatMapData = useMemo(() => altitudeStream.map((v, ix) => ({
    lat: latlngStream[ix]?.[0] || 0,
    lon: latlngStream[ix]?.[1] || 0,
    measure: v
  })).slice(20, altitudeStream.length - 20), [altitudeStream, latlngStream]);

  const gradeHeatMapData = useMemo(() => gradeStream.map((v, ix) => ({
    lat: latlngStream[ix]?.[0] || 0,
    lon: latlngStream[ix]?.[1] || 0,
    measure: v
  })).slice(20, gradeStream.length - 20), [gradeStream, latlngStream]);

  const velocityHeatMapData = useMemo(() => velocityStream.map((v, ix) => ({
    lat: latlngStream[ix]?.[0] || 0,
    lon: latlngStream[ix]?.[1] || 0,
    measure: v
  })).slice(20, velocityStream.length - 20), [velocityStream, latlngStream]);

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
          streamPins={streamPins}
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
          <Button type="button" onClick={() => savePreferences({ activityId: id })}>Save</Button>
        </form>
      </div>
      <Basic.Div
        $display="flex"
        $direction="column"
        $directionMdUp="row"
        $marginT="20px"
        $padT="20px"
        $borderT="1px solid #ccc"
        $gap={1}
      >
        <Basic.Div $width="50%" $widthSmDown="100%">
          <Basic.Div $fontSize="h2" $marginB={1}>Heart Rate</Basic.Div>
          <HeatMapMapLibre
            title="Heart Rate"
            data={hrHeatMapData}
            measure="measure"
            height={600}
            deferRender={hrHeatMapData.length === 0}
            minColor={[0, 0, 255, 1]}
            maxColor={[255, 0, 0, 1]}
          />
        </Basic.Div>
        <Basic.Div $width="50%" $widthSmDown="100%">
          <Basic.Div $fontSize="h2" $marginB={1}>Velocity</Basic.Div>
          <HeatMapMapLibre
            title="Velocity"
            data={velocityHeatMapData}
            measure="measure"
            height={600}
            deferRender={velocityHeatMapData.length === 0}
            minColor={[255, 0, 0, 1]}
            maxColor={[0, 255, 0, 1]}
          />
        </Basic.Div>
        <Basic.Div $width="50%" $widthSmDown="100%">
          <Basic.Div $fontSize="h2" $marginB={1}>Altitude</Basic.Div>
          <HeatMapMapLibre
            title="Altitude"
            data={altitudeHeatMapData}
            measure="measure"
            height={600}
            deferRender={altitudeHeatMapData.length === 0}
            minColor={[0, 0, 255, 1]}
            maxColor={[255, 255, 0, 1]}
          />
        </Basic.Div>
        <Basic.Div $width="50%" $widthSmDown="100%">
          <Basic.Div $fontSize="h2" $marginB={1}>Grade</Basic.Div>
          <HeatMapMapLibre
            title="Grade"
            data={gradeHeatMapData}
            measure="measure"
            height={600}
            deferRender={gradeHeatMapData.length === 0}
            minColor={[0, 255, 0, 1]}
            maxColor={[255, 0, 0, 1]}
          />
        </Basic.Div>
      </Basic.Div>
    </div>
  );
};

export default HeartZonesChartContainer;
