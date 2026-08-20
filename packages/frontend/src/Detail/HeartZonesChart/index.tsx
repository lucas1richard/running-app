import GradientMapMapLibre from '@/Common/GradientMapMapLibre';
import { emptyArray } from '@/constants';
import HeartZonesChartDisplay from '@/Detail/HeartZonesChart/HeartZonesChartDisplay';
import { Basic, Button } from '@/DLS';
import { useAppSelector } from '@/hooks/redux';
import usePreferenceControl from '@/hooks/usePreferenceControl';
import { selectActivity, selectActivityDetails, selectStreamTypeData } from '@/reducers/activities';
import { selectHeartZones } from '@/reducers/heartzones';
import { useEffect, useMemo, useRef, useState } from 'react';
import useCalculatedGrade from './useCalculatedGrade';

type SyncedViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
};

const HeartZonesChartContainer = ({ id }) => {
  const [viewState, setViewState] = useState<SyncedViewState>();
  const pendingViewStateRef = useRef<SyncedViewState>();
  const frameRef = useRef<number | null>(null);
  const activity = useAppSelector((state) => selectActivity(state, id));
  const heartRateStream = useAppSelector((state) => selectStreamTypeData(state, id, 'heartrate'));
  const velocityStream = useAppSelector((state) => selectStreamTypeData(state, id, 'velocity_smooth'));
  const altitudeStream = useAppSelector((state) => selectStreamTypeData(state, id, 'altitude'));
  const timeStream = useAppSelector((state) => selectStreamTypeData(state, id, 'time'));
  const gradeStream = useAppSelector((state) => selectStreamTypeData(state, id, 'grade_smooth'));
  const distanceStream = useAppSelector((state) => selectStreamTypeData(state, id, 'distance'));
  const latlngStream = useAppSelector((state) => selectStreamTypeData(state, id, 'latlng'));
  const zones = useAppSelector((state) => selectHeartZones(state, activity?.start_date));
  const details = useAppSelector((state) => selectActivityDetails(state, id));
  const streamPins = activity?.stream_pins || emptyArray;
  const bestEfforts = details?.best_efforts || emptyArray;
  const laps = details?.laps || emptyArray;
  const splitsMi = details?.splits_standard || emptyArray;

  // intervals.icu does not provide a grade stream
  const syntheticGradeStream = useCalculatedGrade(altitudeStream, distanceStream, 10);

  const fullTime = useMemo(() => {
    const maxTime = timeStream[timeStream.length - 1];
    const timeArr = new Array(maxTime).fill(0).map((_, ix) => ix);
    for (let i = 0, j = 0; i < timeArr.length; i++) {
      if (timeStream[j] === i) j++;
      else timeArr[i] = null;
    }
    return timeArr;
  }, [timeStream]);

  // const smoothVelocity = useMemo(
  //   () => getSmoothVal(fullTime, velocityStream, 1),
  //   [fullTime, velocityStream, 1]
  // );

  const heartRateWithNulls = useMemo(
    // () => getSmoothVal(fullTime, data, smoothAverageWindow),
    () => {
      const maxTime = timeStream[timeStream.length - 1];
      const fullDataWithNulls = new Array(maxTime).fill(null);
      heartRateStream.forEach((val, ix) => fullDataWithNulls[timeStream[ix]] = val);
      return fullDataWithNulls;
    },
    [fullTime, heartRateStream]
  );
  const velocityWithNulls = useMemo(
    () => {
      const maxTime = timeStream[timeStream.length - 1];
      const fullDataWithNulls = new Array(maxTime).fill(null);
      velocityStream.forEach((val, ix) => fullDataWithNulls[timeStream[ix]] = val);
      return fullDataWithNulls;
    },
    [fullTime, velocityStream]
  );

  const altitudeWithNulls = useMemo(
    () => {
      const maxTime = timeStream[timeStream.length - 1];
      const fullDataWithNulls = new Array(maxTime).fill(null);
      altitudeStream.forEach((val, ix) => fullDataWithNulls[timeStream[ix]] = val);
      return fullDataWithNulls;
    },
    [fullTime, altitudeStream]
  );

  const cutoff = 2;

  const latLngWithNulls = useMemo(() => {
    const maxTime = timeStream[timeStream.length - 1];
    const fullDataWithNulls = new Array(maxTime).fill(null);
    latlngStream.forEach((val, ix) => fullDataWithNulls[timeStream[ix]] = val);
    return fullDataWithNulls;
  }, []);

  const hrHeatMapData = useMemo(() => heartRateWithNulls.map((v, ix) => v === null ? v : ({
    lat: latLngWithNulls[ix]?.[0] || 0,
    lon: latLngWithNulls[ix]?.[1] || 0,
    measure: v
  })).slice(cutoff, heartRateWithNulls.length - cutoff), [heartRateWithNulls, latLngWithNulls]);

  const altitudeHeatMapData = useMemo(() => altitudeWithNulls.map((v, ix) => v === null ? v : ({
    lat: latlngStream[ix]?.[0] || 0,
    lon: latlngStream[ix]?.[1] || 0,
    measure: v
  })).slice(cutoff, altitudeWithNulls.length - cutoff), [altitudeWithNulls, latlngStream]);

  const gradeHeatMapData = useMemo(() => gradeStream.map((v, ix) => v === null ? v : ({
    lat: latlngStream[ix]?.[0] || 0,
    lon: latlngStream[ix]?.[1] || 0,
    measure: v
  })).slice(cutoff, gradeStream.length - cutoff), [gradeStream, latlngStream]);

  const velocityHeatMapData = useMemo(() => velocityWithNulls.map((v, ix) => v === null ? v : ({
    lat: latlngStream[ix]?.[0] || 0,
    lon: latlngStream[ix]?.[1] || 0,
    measure: v
  })).slice(cutoff, velocityWithNulls.length - cutoff), [velocityWithNulls, latlngStream]);

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

  useEffect(() => () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }
  }, []);

  const syncViewState = ({ viewState: nextViewState }) => {
    if (!nextViewState) return;
    pendingViewStateRef.current = {
      longitude: nextViewState.longitude,
      latitude: nextViewState.latitude,
      zoom: nextViewState.zoom,
    };

    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      setViewState((prev) => {
        const next = pendingViewStateRef.current;
        if (!next) return prev;
        if (
          prev
          && Math.abs(prev.longitude - next.longitude) < 0.00001
          && Math.abs(prev.latitude - next.latitude) < 0.00001
          && Math.abs(prev.zoom - next.zoom) < 0.01
        ) {
          return prev;
        }
        return next;
      });
    });
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
          grade={gradeStream.length ? gradeStream : syntheticGradeStream}
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
            viewState={viewState}
            onZoom={syncViewState}
            onDrag={syncViewState}
            data={hrHeatMapData}
            measure="measure"
            latLngWithNulls={latLngWithNulls}
            time={timeStream}
            height={600}
            deferRender={hrHeatMapData.length === 0}
            minColor={[72, 138, 248, 1]}
            maxColor={[255, 0, 0, 1]}
            floorValue={getPercentile(0.1, hrHeatMapData.filter(Boolean))}
            ceilingValue={getPercentile(0.99, hrHeatMapData.filter(Boolean))}
          />
        </Basic.Div>
        <Basic.Div $width="50%" $widthSmDown="100%">
          <Basic.Div $fontSize="h2" $marginB={1}>Velocity</Basic.Div>
          <GradientMapMapLibre
            id={id}
            animated={true}
            time={timeStream}
            title="Velocity"
            viewState={viewState}
            onZoom={syncViewState}
            onDrag={syncViewState}
            data={velocityHeatMapData}
            measure="measure"
            latLngWithNulls={latLngWithNulls}
            height={600}
            deferRender={velocityHeatMapData.length === 0}
            minColor={[72, 138, 248, 1]}
            maxColor={[255, 0, 0, 1]}
            floorValue={getPercentile(0.1, velocityHeatMapData.filter(Boolean))}
            ceilingValue={getPercentile(0.99, velocityHeatMapData.filter(Boolean))}
          />
        </Basic.Div>
        <Basic.Div $width="50%" $widthSmDown="100%">
          <Basic.Div $fontSize="h2" $marginB={1}>Altitude</Basic.Div>
          <GradientMapMapLibre
            id={id}
            animated={true}
            title="Altitude"
            viewState={viewState}
            onZoom={syncViewState}
            onDrag={syncViewState}
            data={altitudeHeatMapData}
            measure="measure"
            latLngWithNulls={latLngWithNulls}
            time={timeStream}
            height={600}
            deferRender={altitudeHeatMapData.length === 0}
            minColor={[72, 138, 248, 1]}
            maxColor={[255, 0, 0, 1]}
            floorValue={getPercentile(0.01, altitudeHeatMapData.filter(Boolean))}
            ceilingValue={getPercentile(0.99, altitudeHeatMapData.filter(Boolean))}
          />
        </Basic.Div>
        {/* <Basic.Div $width="50%" $widthSmDown="100%">
          <Basic.Div $fontSize="h2" $marginB={1}>Grade</Basic.Div>
          <GradientMapMapLibre
            id={id}
            animated={true}
            title="Grade"
            data={gradeHeatMapData}
            measure="measure"
            latLngWithNulls={latLngWithNulls}
            height={600}
            deferRender={gradeHeatMapData.length === 0}
            time={timeStream}
            minColor={[72, 138, 248, 1]}
            maxColor={[255, 0, 0, 1]}
            floorValue={getPercentile(0.01, gradeHeatMapData)}
            ceilingValue={getPercentile(0.99, gradeHeatMapData)}
          />
        </Basic.Div> */}
      </Basic.Div>
    </div>
  );
};

export default HeartZonesChartContainer;
