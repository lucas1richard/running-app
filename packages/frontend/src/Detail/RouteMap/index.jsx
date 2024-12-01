import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMap from 'highcharts/modules/map';
import { selectStreamType } from '../../reducers/activities';
import { useSelector } from 'react-redux';
import { hrZonesText } from '../../colors/hrZones';
import { convertMetricSpeedToMPH } from '../../utils';

HighchartsMap(Highcharts);

const RouteMap = ({ id, pointer, segments, hrzones, velocity }) => {
  const latlngStream = useSelector((state) => selectStreamType(state, id, 'latlng'));

  const [animating, setAnimating] = React.useState(false);
  const [animationPointer, setAnimationPointer] = React.useState(0);
  const intervalRef = useRef(null);

  const  usedPointer = animating ? animationPointer : pointer;

  const coordsPure = useMemo(() => {
    if (!latlngStream?.data) return [];
    return latlngStream.data.map(([lat, lon]) => ({ lon, lat }));
  }, [latlngStream]);

  const indicatorColor = useMemo(() => {
    if (!hrzones) return 'black';
    const { zone } = hrzones.find(
      ({ from }, ix) => from <= usedPointer && hrzones[ix + 1]?.from > usedPointer
    ) || hrzones[hrzones.length - 1];
    return { fill: hrZonesText[zone], stroke: 'black' };
  }, [hrzones, usedPointer]);

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
    return segments.map((segment, ix) => ({
      type: 'mapline',
      name: `Segment ${ix + 1}`,
      data: [{
        geometry: {
          type: 'LineString',
          coordinates: coordsPure.slice(segment[0], segment[0] + segment[2]).map(({ lon, lat }) => [lon, lat]),
        },
      }],
      animation: false,
      lineWidth: 6,
      enableMouseTracking: false,
    }));
  }, [coordsPure, segments]);

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
        color: indicatorColor.fill,
      },
    ],
  }), [coordsPure, indicatorColor, usedPointer, series]);

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