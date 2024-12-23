import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMap from 'highcharts/modules/map';
import { selectStreamTypeData } from '../../reducers/activities';
import { convertMetricSpeedToMPH } from '../../utils';
import { useAppSelector } from '../../hooks/redux';
import useHRZoneIndicators from './useHRZoneIndicators';
import classNames from 'classnames';
import getGradeColorAbs from '../HeartZonesChart/getGradeColorAbs';
import { emptyArray } from '../../constants';
import useViewSize from '../../hooks/useViewSize';

HighchartsMap(Highcharts);

type Props = {
  id: number;
  averageSpeed: number;
  pointer: number;
  pins: Array<StreamPin>;
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
  const viewSize = useViewSize();
  const latlngStream = useAppSelector((state) => selectStreamTypeData(state, id, 'latlng'));

  const [animating, setAnimating] = React.useState(false);
  const [animationPointer, setAnimationPointer] = React.useState(0);
  const intervalRef = useRef(null);

  const usedPointer = animating ? animationPointer : pointer;
  const isSmall = viewSize.lte('sm');

  const coordsPure = useMemo(() => {
    if (!latlngStream) return emptyArray;
    return latlngStream.map(([lat, lon]) => ({ lon, lat }));
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

  const seriesColors = useMemo(
    () => getGradeColorAbs(segments.map((s) => s[1]), 0, averageSpeed),
    [averageSpeed, segments]
  );

  const memoSeries = useMemo(() => {
    return ({
      type: 'mapline',
      id: 'segments',
      key: 'segments',
      name: `Segments`,
      data: segments.map((segment, ix) => ({
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
        color: seriesColors[ix][1],
      })),
      animation: false,
      lineWidth: isSmall ? 3 : 6,
      showInLegend: false,
      enableMouseTracking: false,
    });
  }, [averageSpeed, coordsPure, segments, seriesColors, isSmall]);

  const memoHighlightedSegment = useMemo(() => {
    return {
      type: 'mapline',
      id: 'highlightedSegment',
      key: 'highlightedSegment',
      name: `Segment Highlight`,
      data: [{
        geometry: {
          type: 'LineString',
          coordinates: coordsPure
            .slice(highlightedSegment.start, highlightedSegment.end)
            .map(({ lon, lat }) => [lon, lat]),
        },
        color: highlightedSegment.color,
        borderColor: 'blue',
      }],
      animation: false,
      lineWidth: isSmall ? 8: 12,
      showInLegend: false,
      enableMouseTracking: false,
    };
  }, [coordsPure, highlightedSegment.color, highlightedSegment.end, highlightedSegment.start, isSmall]);

  const memoPins = useMemo(() => ({
      type: 'mappoint',
      name: 'pins',
      id: 'pins',
      key: 'pins',
      data: pins.map((pin) => ({
        ...coordsPure[pin.index],
        id: pin.index,
        key: pin.index,
        marker: {
          symbol: 'diamond',
          radius: 12,
          lineColor: 'black',
          lineWidth: 1,
        },
        color: 'magenta',
      })),
      showInLegend: false,
      animation: false,
    }), [pins, coordsPure]);
  
  const memoPointer = useMemo(() => ({
    type: 'mappoint',
    id: 'Location',
    key: 'Location',
    name: 'Location',
    data: [coordsPure[usedPointer]],
    marker: {
      symbol: 'circle',
      radius: isSmall ? 5 : 10,
      lineColor: indicatorColor.stroke,
      lineWidth: isSmall ? 2 : 4,
    },
    animation: false,
    enableMouseTracking: false,
    color: indicatorColor.fill,
  }), [coordsPure, usedPointer, isSmall, indicatorColor.stroke, indicatorColor.fill]);

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
      memoPointer,
      memoHighlightedSegment,
      memoPins,
      memoSeries,
    ],
  }), [memoPointer, memoHighlightedSegment, memoPins, memoSeries]);

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