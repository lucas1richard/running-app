import { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { condenseZonesFromHeartRate, getGradeColor } from '../utils';

const colors = [
  'black',
  'rgba(0, 132, 255, 0.2)',
  'rgba(0,255,0,0.2)',
  'rgba(255, 251, 0, 0.1)',
  'rgba(255, 115, 0, 0.1)',
  'rgba(255,0,0,0.2)',
];

const HeartRateChart = ({ title, data, velocity, zones, width, grade }) => {
  const hrzones = useMemo(() => condenseZonesFromHeartRate(zones, data), []);
  const gradePlots = useMemo(() => getGradeColor(grade, { relativeMode: true, vertex: 20 }), []);

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
        color: 'black',

      },
      velocity && {
        name: 'Velocity',
        data: velocity.map(val => val * 2.237),
        yAxis: 1,
        color: 'darkred'
      }
    ].filter(Boolean),
    xAxis: {
      plotBands: hrzones.map((band) => ({
        color: colors[band.zone],
        ...band
      })),
      // plotBands: gradePlots,
    },
    yAxis: [
      { // Primary yAxis
        labels: {
          style: {
            color: 'black'
          }
        },
        title: {
          text: 'HeartRate',
          style: {
            color: 'black'
          }
        },
      },
      { // Secondary yAxis
        gridLineWidth: 0,
        title: {
          text: 'Velocity',
          style: {
            color: 'darkred'
          }
        },
        labels: {
          format: '{value} mph',
          style: {
            color: 'darkred'
          }
        },
        opposite: true,
      }
    ]
  };
  /** @type {Highcharts.Options} */
  const options2 = {
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
        color: 'black',
      },
      velocity && {
        name: 'Velocity',
        data: velocity.map(val => val * 2.237),
        yAxis: 1,
        color: 'darkred'
      },
      grade && {
        name: 'grade',
        data: grade.map(val => val * 2.237),
        yAxis: 2,
        color: 'blue',
      },
    ].filter(Boolean),
    xAxis: {
      plotBands: gradePlots,
    },
    yAxis: [
      { // Primary yAxis
        labels: {
          style: {
            color: 'black'
          }
        },
        title: {
          text: 'HeartRate',
          style: {
            color: 'black'
          }
        },
      },
      { // Secondary yAxis
        gridLineWidth: 0,
        title: {
          text: 'Velocity',
          style: {
            color: 'darkred'
          }
        },
        labels: {
          format: '{value} mph',
          style: {
            color: 'darkred'
          }
        },
        opposite: true,
      },
      { // Secondary yAxis
        gridLineWidth: 0,
        title: {
          text: 'Altitude',
          style: {
            color: 'blue'
          }
        },
        labels: {
          format: '{value} ft',
          style: {
            color: 'blue'
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
      <HighchartsReact
        highcharts={Highcharts}
        options={options2}
        allowChartUpdate={true}
      />
    </div>
  );
};

export default HeartRateChart;
