import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMap from 'highcharts/modules/map';
import { selectStreamType } from '../../reducers/activities';
import { useSelector } from 'react-redux';

HighchartsMap(Highcharts);

const RouteMap = ({ id, pointer }) => {
  const latlngStream = useSelector((state) => selectStreamType(state, id, 'latlng'));

  const coordsPure = useMemo(() => {
    if (!latlngStream?.data) {
      return [];
    }

    return latlngStream.data.map(([lat, lon]) => ({ lon, lat }));
  }, [latlngStream]);

  const routeData = useMemo(() => {
    if (!latlngStream?.data) {
      return {
        coordsRoute: [],
      };
    }

    const coordsRoute = [];
    for (let i = 0; i < latlngStream.data.length; i += 6) {
      coordsRoute.push(latlngStream.data[i]);
    }

    return {
      coordsRoute: coordsRoute.map(([lat, lon]) => [lon, lat]),
    };
  }, [latlngStream]);

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
      {
        type: 'mapline',
        name: 'Route',
        data: [{
          geometry: {
            type: 'LineString',
            coordinates: routeData.coordsRoute,
          },
        }],
        animation: false,
        lineWidth: 4,
        enableMouseTracking: false,
      },
      {
        type: 'mappoint',
        name: 'Location',
        data: [coordsPure[pointer]],
        marker: {
          symbol: 'circle',
          radius: 8,
        },
        color: 'red',
      },
    ],
  }), [coordsPure, pointer, routeData.coordsRoute]);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      constructorType={'mapChart'}
      options={options}
    />
  );
};

export default RouteMap;