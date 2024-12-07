import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMap from 'highcharts/modules/map';
import { selectStreamTypeMulti } from '../../reducers/activities';
import { useSelector } from 'react-redux';
import { hrZonesText } from '../../colors/hrZones';
import DetailDataFetcher from '../DetailDataFetcher';
import useSegments from '../HeartZonesChart/useSegments';

HighchartsMap(Highcharts);

const emptyArray = [];

const RouteMapMulti = ({ activityConfigs }) => {
  const {
    pointer,
    pins,
    highlightedSegment = { start: 0, end: 0, color: 'white' },
  } = activityConfigs[0];

  const ids = activityConfigs.map(({ id }) => id);
  
  const segmentsArray = useSegments(ids);
  const latlngStreamArray = useSelector((state) => selectStreamTypeMulti(state, ids, 'latlng')) || emptyArray;
  const hrzonesArray = useMemo(() => activityConfigs.map(({ hrzones }) => hrzones), [activityConfigs]);

  const [animating, setAnimating] = React.useState(false);
  const [animationPointer, setAnimationPointer] = React.useState(0);
  const intervalRef = useRef(null);

  const usedPointer = animating ? animationPointer : pointer;

  const coordsPure = useMemo(
    () => latlngStreamArray.map(
      (latlngStream) => latlngStream?.data?.map(([lat, lon]) => ({ lon, lat })) || []
    ),
    [latlngStreamArray]
  );

  const indicatorColors = useMemo(() => {
    return ids.map((id, ix) => {
      const hrzones = hrzonesArray[ix];
      if (!hrzones) return 'black';
      const { zone } = hrzones.find(
        ({ from }, ix) => from <= usedPointer && hrzones[ix + 1]?.from > usedPointer
      ) || hrzones[hrzones.length - 1];
      return { fill: hrZonesText[zone], stroke: ix === 0 ? 'black' : 'red' };
    });
  }, [hrzonesArray, ids, usedPointer]);

  const animate = useCallback(() => {
    setAnimationPointer((prev) => {
      const nextPointer = (prev + 2) % coordsPure.length;
      if (nextPointer === 0 || nextPointer === 1) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setAnimating(false);
      }
      return nextPointer;
    });
  }, [coordsPure.length]);

  const series = useMemo(() => {
    return segmentsArray.map((segments, ix) => segments?.data?.map((segment, iy) => ({
      type: 'mapline',
      name: `Segment ${iy + 1}`,
      data: [{
        geometry: {
          type: 'LineString',
          coordinates: coordsPure[ix].slice(segment[0], segment[0] + segment[2]).map(({ lon, lat }) => [lon, lat]),
        },
      }],
      showInLegend: false,
      animation: false,
      lineWidth: 6,
      enableMouseTracking: false,
    })) || [], []);
  }, [coordsPure, segmentsArray]);

  const memoHighlightedSegment = useMemo(() => {
    return {
      type: 'mapline',
      name: `Segment Highlight`,
      data: [{
        geometry: {
          type: 'LineString',
          coordinates: coordsPure
            .slice(highlightedSegment.start, highlightedSegment.end)
            .map(({ lon, lat }) => [lon, lat]),
        },
        color: highlightedSegment.color,
        borderColor: 'black',
      }],
      animation: false,
      lineWidth: 12,
      enableMouseTracking: false,
    };
  }, [coordsPure, highlightedSegment.color, highlightedSegment.end, highlightedSegment.start]);

  const memoPins = useMemo(() => ({
      type: 'mappoint',
      name: 'pins',
      data: pins.map((pin) => ({
        ...pin,
        ...coordsPure[pin.index],
        marker: {
          symbol: pin.symbol,
          radius: pin.radius || 7,
          lineColor: pin.lineColor || pin.color || 'black',
          lineWidth: pin.lineWidth || 1,
        },
      })),
      animation: false,
    }), [pins, coordsPure]);

  useEffect(() => {
    if (animating && !intervalRef.current) {
      intervalRef.current = setInterval(animate, 20);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [animate, animating, coordsPure.length]);

  const options = useMemo(() => 
    /** @type {Highcharts.Options} */
    ({
    chart: {
      map: 'custom/world',
      height: 900,
      animation: false,
    },
    title: {
      text: 'Route',
    },
    series: [
      ...series.map((series) => series).flat(),
      memoHighlightedSegment,
      memoPins,
      ...coordsPure.map((coords, ix) => ({
        type: 'mappoint',
        name: ix === 0 ? 'Current' : ids[ix],
        data: [usedPointer < coords.length ? coords[usedPointer] : coords[coords.length - 1]],
        dataLabels: {
          enabled: false,
          format: ix === 0 ? 'Current' : ids[ix],
        },
        marker: {
          symbol: ix === 0 ? 'circle' : 'diamond',
          radius: 10,
          lineColor: indicatorColors[ix].stroke,
          lineWidth: 2,
        },
        animation: false,
        color: indicatorColors[ix].fill,
      })),
    ],
  }), [series, memoHighlightedSegment, memoPins, coordsPure, usedPointer, indicatorColors]);

  return (
    <div>
      {ids.map((id, ix) => <DetailDataFetcher key={id} id={id} />)}
      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'mapChart'}
        options={options}
      />
      <div>
        <button onClick={() => setAnimating((prev) => !prev)}>Animate</button>
      </div>
    </div>
  );
};

export default RouteMapMulti;