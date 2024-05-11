import { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { condenseZonesFromHeartRate } from '../utils';

const colors = [
  'black',
  'rgba(0, 132, 255, 0.2)',
  'rgba(0,255,0,0.2)',
  'rgba(255, 251, 0, 0.1)',
  'rgba(255, 115, 0, 0.1)',
  'rgba(255,0,0,0.2)',
];

const HeartRateChart = ({ title, data, velocity, zones, width }) => {
  const hrzones = useMemo(() => condenseZonesFromHeartRate(zones, data), []);

  /** @type {Highcharts.ChartOptions} */
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
      },
      velocity && {
        name: 'Velocity',
        data: velocity.map(val => val * 2.237),
        yAxis: 1,
          color: 'rgba(0,0,0,0.25)'
      }
    ].filter(Boolean),
    xAxis: {
      plotBands: hrzones.map((band) => ({
        color: colors[band.zone],
        ...band
      })),
    },
    yAxis: [
      { // Primary yAxis
        labels: {
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        },
        title: {
          text: 'HeartRate',
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        },
      },
      { // Secondary yAxis
        gridLineWidth: 0,
        title: {
          text: 'Velocity',
          style: {
            color: 'rgba(0,0,0,0.25)'
          }
        },
        labels: {
          format: '{value} mph',
          style: {
            color: 'rgba(0,0,0,0.25)'
          }
        },
        opposite: true,
      }
    ]
  };

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        allowChartUpdate={true}
      />
    </div>
  );
};

export default HeartRateChart;
