import { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { getGradeColor } from '../utils';
import Surface from '../DLS/Surface';

const ElevationChart = ({ title, data, velocity, zones, width, grade }) => {
  const gradePlots = useMemo(() => getGradeColor(grade, { relativeMode: true, vertex: 20 }), []);

  /** @type {Highcharts.Options} */
  const options2 = {
    chart: {
      type: 'line',
      height: 400,
      width,
      backgroundColor: 'transparent',
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
        lineWidth: 3,
        animation: false,
      },
      velocity && {
        name: 'Velocity',
        data: velocity.map(val => Math.round((val * 100 * 2.237)) / 100),
        yAxis: 1,
        color: 'black',
        lineWidth: 2,
        animation: false,
      },
      grade && {
        name: 'Altitude',
        data: grade.map(val => Math.round(val * 10 * 2.237) / 10),
        yAxis: 2,
        color: 'blue',
        lineWidth: 1,
        animation: false,
      },
    ].filter(Boolean),
    xAxis: {
      plotBands: gradePlots,
      gridLineWidth: 1,
      alignTicks: false,
      tickInterval: 60,
      gridLineColor: '#aaa'
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
      },
      { // Altitude yAxis
        enabled: false,
        labels: {
          enabled: false,
        },
        title: {
          enabled: false,
        }
      }
    ]
  };

  return (
    <Surface>
      <HighchartsReact
        highcharts={Highcharts}
        options={options2}
        allowChartUpdate={true}
      />
    </Surface>
  );
};

export default ElevationChart;
