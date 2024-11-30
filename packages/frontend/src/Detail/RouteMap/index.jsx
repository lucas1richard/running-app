import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMap from 'highcharts/modules/map';
import { selectStreamType } from '../../reducers/activities';
import { useSelector } from 'react-redux';

HighchartsMap(Highcharts);

const RouteMap = ({ id, pointer, segments }) => {
  const latlngStream = useSelector((state) => selectStreamType(state, id, 'latlng'));

  const coordsPure = useMemo(() => {
    if (!latlngStream?.data) return [];
    return latlngStream.data.map(([lat, lon]) => ({ lon, lat }));
  }, [latlngStream]);

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
        data: [coordsPure[pointer]],
        marker: {
          symbol: 'circle',
          radius: 10,
        },
        color: 'red',
      },
    ],
  }), [coordsPure, pointer, series]);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      constructorType={'mapChart'}
      options={options}
    />
  );
};

export default RouteMap;