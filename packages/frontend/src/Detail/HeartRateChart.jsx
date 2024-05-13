import { useMemo } from 'react';
import Highcharts, { animate } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { condenseZonesFromHeartRate, getGradeColor } from '../utils';
import { hrZonesBg } from '../colors/hrZones';



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
        color: 'red',
        lineWidth: 2,
        animation: false,

      },
      velocity && {
        name: 'Velocity',
        data: velocity.map(val => val * 2.237),
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
      // plotBands: gradePlots,
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
        color: 'red',
        lineWidth: 3,
        animation: false,
      },
      velocity && {
        name: 'Velocity',
        data: velocity.map(val => val * 2.237),
        yAxis: 1,
        color: 'black',
        lineWidth: 2,
        animation: false,
      },
      grade && {
        name: 'grade',
        data: grade.map(val => val * 2.237),
        yAxis: 2,
        color: 'blue',
        lineWidth: 1,
        animation: false,
      },
    ].filter(Boolean),
    xAxis: {
      plotBands: gradePlots,
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
