import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMap from 'highcharts/modules/map';
import { selectStreamType } from '../../reducers/activities';
import { convertMetricSpeedToMPH } from '../../utils';
import { useAppSelector } from '../../hooks/redux';
import useHRZoneIndicators from './useHRZoneIndicators';
import classNames from 'classnames';

HighchartsMap(Highcharts);

type Props = {
  id: number;
  averageSpeed: number;
  pointer: number;
  pins: Array<{
    index: number;
    symbol: string;
    color: string;
    radius?: number;
    lineColor?: string;
    lineWidth?: number
  }>;
  segments: Array<[start: number, mphSpeed: number, end: number]>;
  velocity: number[];
  smoothAverageWindow: number;
  highlightedSegment?: { start: number; end: number; color: string };
};

const RouteMap: React.FC<Props> = ({
  id,
  averageSpeed,
  pointer,
  pins,
  segments,
  velocity,
  smoothAverageWindow,
  highlightedSegment = { start: 0, end: 0, color: 'white' },
}) => {
  const latlngStream = useAppSelector((state) => selectStreamType(state, id, 'latlng'));

  const [animating, setAnimating] = React.useState(false);
  const [animationPointer, setAnimationPointer] = React.useState(0);
  const intervalRef = useRef(null);

  const usedPointer = animating ? animationPointer : pointer;

  const coordsPure = useMemo(() => {
    if (!latlngStream?.data) return [];
    return latlngStream.data.map(([lat, lon]) => ({ lon, lat }));
  }, [latlngStream]);

  const [indicatorColor] = useHRZoneIndicators([id], usedPointer, smoothAverageWindow);

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

  // const series = useMemo(() => {
  //   return [({
  //     type: 'mapline',
  //     name: `Segment`,
  //     data: segments.map((segment) => ({
  //       geometry: {
  //         type: 'LineString',
  //         coordinates: coordsPure.slice(segment[0], segment[0] + segment[2]).map(({ lon, lat }) => [lon, lat]),
  //         // coordinates: [
  //         //   coordsPure.slice(segment[0], segment[0] + segment[2]).map(({ lon, lat }) => [lon, lat])[0],
  //         //   coordsPure.slice(segment[0], segment[0] + segment[2]).map(({ lon, lat }) => [lon, lat])[100]
  //         // ],
  //       },
  //       className: 'animated-line',
  //     })),
  //     lineWidth: 6,
  //     enableMouseTracking: false,
  //   })];
  // }, [coordsPure, segments]);

  const series = useMemo(() => {
    return segments.map((segment, ix) => ({
      type: 'mapline',
      name: `Segment ${ix + 1}`,
      data: [{
        geometry: {
          type: 'LineString',
          coordinates: coordsPure.slice(segment[0], segment[0] + segment[2]).map(({ lon, lat }) => [lon, lat]),
        },
        className: classNames('animated-line', {
          'animate-fast': segment[1] / averageSpeed > 1.1,
          'animate-slow': segment[1] / averageSpeed < 0.9,
        }),
        styleProp: {
          display: 'none'
        },
      }],
      animation: false,
      lineWidth: 6,
      enableMouseTracking: false,
    }));
  }, [coordsPure, segments]);

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
      ...series,
      memoHighlightedSegment,
      memoPins,
      {
        type: 'mappoint',
        name: 'Location',
        data: [coordsPure[usedPointer]],
        marker: {
          symbol: 'circle',
          radius: 10,
          lineColor: indicatorColor.stroke,
          lineWidth: 4,
        },
        animation: false,
        enableMouseTracking: false,
        color: indicatorColor.fill,
      },
    ],
  }), [
    series,
    memoHighlightedSegment,
    memoPins,
    coordsPure,
    usedPointer,
    indicatorColor.stroke,
    indicatorColor.fill
  ]);

  return (
    <div>
      {`${convertMetricSpeedToMPH(velocity[usedPointer]).toFixed(2)} mph`}
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

export default RouteMap;