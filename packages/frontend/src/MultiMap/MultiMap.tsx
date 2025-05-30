import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMap from 'highcharts/modules/map';
import { useAppSelector } from '../hooks/redux';
import { selectActivity, selectStreamTypeMulti } from '../reducers/activities';
import DetailDataFetcher from '../Detail/DetailDataFetcher';
import useSegments from '../Detail/HeartZonesChart/useSegments';
import useHRZoneIndicators from '../Detail/RouteMap/useHRZoneIndicators';
import dayjs from 'dayjs';
import { emptyArray } from '../constants';
import { Button } from '../DLS';
import Surface from '../DLS/Surface';

HighchartsMap(Highcharts);

const defHighlightedSegment = { start: 0, end: 0, color: 'white' };

const MultiMap = ({
  indexPointer = undefined,
  activityConfigs,
  showSegments = true,
}) => {
  const ids = useMemo(() => activityConfigs.map(({ id }) => id), [activityConfigs]);
  const activities = useAppSelector((state) => ids.map((id) => selectActivity(state, id)));

  const [progress, setProgress] = useState(0);

  const segmentsArray = useSegments(ids);
  const latlngStreamArray = useAppSelector((state) => selectStreamTypeMulti(state, ids, 'latlng')) || emptyArray;
  const longestStream = latlngStreamArray.reduce((acc, val) => Math.max(acc, val?.length || 0), 0);
  const highlightedSegmentArray = useMemo(
    () => activityConfigs.map(({ highlightedSegment }) => highlightedSegment || defHighlightedSegment),
    [activityConfigs]
  );

  const [animating, setAnimating] = useState(false);
  const [animationPointer, setAnimationPointer] = useState(0);
  const intervalRef = useRef(null);

  const usedPointer = animating
    ? animationPointer
    : indexPointer || progress;

  const coordsPure = useMemo(
    () => latlngStreamArray.map(
      (latlngStream) => latlngStream?.map(([lat, lon]) => ({ lon, lat })) || emptyArray
    ),
    [latlngStreamArray]
  );

  const indicatorColors = useHRZoneIndicators(ids, usedPointer, 20);

  const animate = useCallback(() => {
    const INCREMENT = 2;
    setAnimationPointer((prev) => {
      const nextPointer = (prev + INCREMENT) % longestStream;
      if (nextPointer < INCREMENT) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setAnimating(false);
      }
      return nextPointer;
    });
  }, [longestStream]);

  const series = useMemo(() => showSegments
    ? segmentsArray.map((segments, ix) => segments?.data?.map(([start, velocity, duration], iy) => ({
      type: 'mapline',
      name: `Segment ${iy + 1}`,
      data: [{
        geometry: {
          type: 'LineString',
          coordinates: coordsPure[ix]
            .slice(start, start + duration)
            .map(({ lon, lat }) => [lon, lat]),
        },
      }],
      showInLegend: false,
      animation: false,
      lineWidth: 6,
      enableMouseTracking: false,
    })) || emptyArray, [])
    : [{
      type: 'mapline',
      data: coordsPure.map((coords) => ({
        geometry: {
          type: 'LineString',
          coordinates: coords.map(({ lon, lat }) => [lon, lat]),
        },
      })),
      showInLegend: false,
      color: undefined,
      animation: false,
      lineWidth: 6,
      enableMouseTracking: false,
    }], [coordsPure, segmentsArray, showSegments]);

  const memoHighlightedSegment = useMemo(() => {
    return {
      type: 'mapline',
      name: `Segment Highlight`,
      data: highlightedSegmentArray.map((highlightedSegment) => ({
        geometry: {
          type: 'LineString',
          coordinates: coordsPure[0]
            .slice(highlightedSegment.start, highlightedSegment.end)
            .map(({ lon, lat }) => [lon, lat]),
        },
        color: highlightedSegment.color,
        borderColor: 'black',
      })),
      animation: false,
      lineWidth: 12,
      enableMouseTracking: false,
    };
  }, [coordsPure, highlightedSegmentArray]);

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

  const hoverProgress = useMemo(() => (
    <div className="flex flex-wrap height-4rem full-width border dls-white-bg">
    {new Array(longestStream).fill(0).map((_, ix) => (
      <div
        key={ix}
        className="flex-item-grow flex-item-shrink"
        onMouseOver={() => setProgress(ix)}
      />
    ))}
  </div>), [longestStream]);

  const options = useMemo(() =>
  /** @type {Highcharts.Options} */
  ({
    chart: {
      map: 'custom/world',
      height: 1200,
      animation: false,
      backgroundColor: 'transparent',
    },
    title: {
      text: 'Route',
    },
    series: [
      ...series.map((series) => series).flat(),
      memoHighlightedSegment,
      ...coordsPure.map((coords, ix) => ({
        type: 'mappoint',
        name: ix === 0 ? 'Current' : dayjs(activities[ix].start_date_local).format('YYYY-MM-DD'),
        data: [usedPointer < coords.length ? coords[usedPointer] : coords[coords.length - 1]],
        dataLabels: {
          enabled: false,
          format: ix === 0 ? 'Current' : dayjs(activities[ix].start_date_local).format('YYYY-MM-DD'),
        },
        marker: {
          symbol: ix === 0 ? 'circle' : undefined,
          radius: 10,
          lineColor: indicatorColors[ix].stroke || 'black',
          lineWidth: ix === 0 ? 6 : 2,
        },
        animation: false,
        color: indicatorColors[ix].fill,
      })),
    ],
  }), [series, memoHighlightedSegment, coordsPure, activities, usedPointer, indicatorColors]);

  return (
    <Surface>
      {ids.map((id, ix) => <DetailDataFetcher key={id} id={id} />)}
      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'mapChart'}
        options={options}
      />
      <div>
        <Button onClick={() => setAnimating((prev) => !prev)}>
          {animating ? 'Stop Animation' : 'Animate'}
        </Button>
      </div>

      {isNaN(indexPointer) && (
        <div>
          Hover to see progress on the map &darr;
          {hoverProgress}
        </div>
      )}
    </Surface>
  );
};

export default MultiMap;