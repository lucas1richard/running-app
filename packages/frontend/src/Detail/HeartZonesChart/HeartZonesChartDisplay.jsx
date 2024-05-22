import { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { condenseZonesFromHeartRate } from '../../utils';
import { hrZonesBg } from '../../colors/hrZones';

const HeartZonesChartDisplay = ({ title, data, velocity, zones, width }) => {
  const hrzones = useMemo(() => condenseZonesFromHeartRate(zones, data), [zones, data]);

  /** @type {Highcharts.Options} */
  const options = {
    chart: {
      type: 'line',
      height: 400,
      width,
    },
    title: {
      text: title,
    },
    zooming: 'x',
    series: [
      {
        name: 'HeartRate',
        data,
        yAxis: 0,
        color: 'red',
        lineWidth: 2,
        animation: false,

      },
      velocity && {
        name: 'Velocity',
        data: velocity.map(val => Math.round((val * 100 * 2.237)) / 100),
        yAxis: 1,
        lineWidth: 1,
        color: 'black',
        animation: false,
      }
    ].filter(Boolean),
    xAxis: {
      plotBands: hrzones.map((band) => ({
        color: hrZonesBg[band.zone],
        ...band
      })),
      gridLineWidth: 2,
      alignTicks: false,
      tickInterval: 240,
      minorGridLineWidth: 1,
      minorTicks: true,
      minorTickInterval: 60,
      minorTickLength: 4,
      minorGridLineColor: 'rgba(0,0,0,0.3)',
      gridLineColor: 'rgba(0,0,0,0.4)'
    },
    yAxis: [
      { // Primary yAxis
        labels: {
          style: {
            color: 'red'
          }
        },
        title: {
          text: 'HeartRate',
          style: {
            color: 'red'
          }
        },
      },
      { // Secondary yAxis
        gridLineWidth: 0,
        title: {
          text: 'Velocity',
          style: {
            color: 'black'
          }
        },
        labels: {
          format: '{value} mph',
          style: {
            color: 'black'
          }
        },
        opposite: true,
      }
    ]
  };

  return (
    <div style={{ height: 400 }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        allowChartUpdate={true}
      />
    </div>
  );
};

export default HeartZonesChartDisplay;
