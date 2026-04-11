import GradientMapMapLibre from '@/Common/GradientMapMapLibre';
import { emptyArray } from '@/constants';
import HeartZonesChartDisplay from '@/Detail/HeartZonesChart/HeartZonesChartDisplay';
import { Basic, Button } from '@/DLS';
import { useAppSelector } from '@/hooks/redux';
import usePreferenceControl from '@/hooks/usePreferenceControl';
import { selectActivity, selectActivityDetails, selectStreamTypeData } from '@/reducers/activities';
import { selectHeartZones } from '@/reducers/heartzones';
import { useMemo } from 'react';
import getSmoothVal from './getSmoothVal';

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

  const fullTime = useMemo(() => {
    const maxTime = timeStream[timeStream.length - 1];
    const timeArr = new Array(maxTime).fill(0).map((_, ix) => ix);
    for (let i = 0, j = 0; i < timeArr.length; i++) {
      if (timeStream[j] === i) j++;
      else timeArr[i] = null;
    }
    return timeArr;
  }, [timeStream]);

  const smoothVelocity = useMemo(
    () => getSmoothVal(fullTime, velocityStream, 1),
    [fullTime, velocityStream, 1]
  );

  const cutoff = 2;

  const hrHeatMapData = useMemo(() => heartRateStream.map((v, ix) => ({
    lat: latlngStream[ix]?.[0] || 0,
    lon: latlngStream[ix]?.[1] || 0,
    measure: v
  })).slice(cutoff, heartRateStream.length - cutoff), [heartRateStream, latlngStream]);

  const altitudeHeatMapData = useMemo(() => altitudeStream.map((v, ix) => ({
    lat: latlngStream[ix]?.[0] || 0,
    lon: latlngStream[ix]?.[1] || 0,
    measure: v
  })).slice(cutoff, altitudeStream.length - cutoff), [altitudeStream, latlngStream]);

  const gradeHeatMapData = useMemo(() => gradeStream.map((v, ix) => ({
    lat: latlngStream[ix]?.[0] || 0,
    lon: latlngStream[ix]?.[1] || 0,
    measure: v
  })).slice(cutoff, gradeStream.length - cutoff), [gradeStream, latlngStream]);

  const velocityHeatMapData = useMemo(() => smoothVelocity.map((v, ix) => ({
    lat: latlngStream[ix]?.[0] || 0,
    lon: latlngStream[ix]?.[1] || 0,
    measure: v
  })).slice(cutoff, smoothVelocity.length - cutoff), [smoothVelocity, latlngStream]);

  const [
    zonesBandsDirection,
    setZonesBandsDirection,
    savePreferences,
  ] = usePreferenceControl<'xAxis' | 'yAxis' | 'none'>(
    ['activities', id, 'zonesBandsDirection'],
    'xAxis'
  );

  const getPercentile = (p: number, data: { measure: number; }[]) => {
    data = data.slice().sort((a, b) => a.measure - b.measure);
    const index = Math.floor(p * data.length - 1);
    return data[index]?.measure || 0;
  };

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
              onChange={() => setZonesBandsDirection('xAxis')}
            />
            xAxis
          </label>
          <label>
            <input
              type="radio"
              value="yAxis"
              checked={zonesBandsDirection === 'yAxis'}
              onChange={() => setZonesBandsDirection('yAxis')}
            />
            yAxis
          </label>
          <label>
            <input
              type="radio"
              value="none"
              checked={zonesBandsDirection === 'none'}
              onChange={() => setZonesBandsDirection('none')}
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
          <GradientMapMapLibre
            id={id}
            animated={true}
            title="Heart Rate"
            data={hrHeatMapData}
            measure="measure"
            time={timeStream}
            height={600}
            deferRender={hrHeatMapData.length === 0}
            minColor={[0, 0, 255, 1]}
            maxColor={[255, 0, 0, 1]}
            floorValue={getPercentile(0.1, hrHeatMapData)}
            ceilingValue={getPercentile(1, hrHeatMapData)}
          />
        </Basic.Div>
        <Basic.Div $width="50%" $widthSmDown="100%">
          <Basic.Div $fontSize="h2" $marginB={1}>Velocity</Basic.Div>
          <GradientMapMapLibre
            id={id}
            animated={true}
            time={timeStream}
            title="Velocity"
            data={velocityHeatMapData}
            measure="measure"
            height={600}
            deferRender={velocityHeatMapData.length === 0}
            minColor={[0, 0, 255, 1]}
            maxColor={[255, 0, 0, 1]}
            floorValue={getPercentile(0, velocityHeatMapData)}
            ceilingValue={getPercentile(1, velocityHeatMapData)}
          />
        </Basic.Div>
        <Basic.Div $width="50%" $widthSmDown="100%">
          <Basic.Div $fontSize="h2" $marginB={1}>Altitude</Basic.Div>
          <GradientMapMapLibre
            id={id}
            animated={true}
            title="Altitude"
            data={altitudeHeatMapData}
            measure="measure"
            time={timeStream}
            height={600}
            deferRender={altitudeHeatMapData.length === 0}
            minColor={[0, 0, 255, 1]}
            maxColor={[255, 0, 0, 1]}
            floorValue={getPercentile(0.01, altitudeHeatMapData)}
            ceilingValue={getPercentile(1, altitudeHeatMapData)}
          />
        </Basic.Div>
        <Basic.Div $width="50%" $widthSmDown="100%">
          <Basic.Div $fontSize="h2" $marginB={1}>Grade</Basic.Div>
          <GradientMapMapLibre
            id={id}
            animated={true}
            title="Grade"
            data={gradeHeatMapData}
            measure="measure"
            height={600}
            deferRender={gradeHeatMapData.length === 0}
            time={timeStream}
            minColor={[0, 0, 255, 1]}
            maxColor={[255, 0, 0, 1]}
            floorValue={getPercentile(0, gradeHeatMapData)}
            ceilingValue={getPercentile(1, gradeHeatMapData)}
          />
        </Basic.Div>
      </Basic.Div>
    </div>
  );
};

export default HeartZonesChartContainer;
