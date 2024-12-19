import dayjs from 'dayjs';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { convertMetricSpeedToMPH } from '../utils';
import { useMemo } from 'react';
import useViewSize from '../hooks/useViewSize';

const seriesDefaultConfig = {
  states: {
    inactive: {
      opacity: 1
    },
    hover: {
      lineWidthPlus: 0,
    },
  },
  fillOpacity: 0.3,
  lineWidth: 4,
  animation: false,
};

const yAxisDefaultConfig = {
  crosshair: true,
  gridLineWidth: 1,
  minorGridLineWidth: 1,
  minorTickInterval: 'auto',
  tickInterval: 1,
  gridLineColor: 'rgba(0,0,0,0.4)',
  minorGridLineColor: 'rgba(0,0,0,0.1)',
  height: '33%',
  opposite: false,
}

const SpeedChart = ({ activities: actProp }) => {
  const viewSize = useViewSize();
  const activities = useMemo(
    () => actProp.filter(({ start_date }) => dayjs(start_date).isAfter(dayjs().subtract(1, 'year'))).reverse(),
    [actProp]
  );

  const enableYAxis = viewSize.gte('md');

  const options = useMemo(() =>
    /** @type {Highcharts.Options} */
    ({
    chart: {
      type: 'line',
      height: 600,
      zooming: {
        type: 'x',
      },
    },
    legend: {
      enabled: false,
    },
    title: {
      text: '&nbsp;',
      align: 'left',
      margin: 20,
      x: 30
    },
    series: [
      {
        name: 'Speed',
        data: activities.map(({ start_date, average_speed }) => [new Date(start_date).getTime(), convertMetricSpeedToMPH(average_speed)]),
        yAxis: 0,
        color: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [[0, '#0f0'], [1, '#f00']],
        },
        ...seriesDefaultConfig,
      },
      {
        name: 'Distance',
        data: activities.map(({ start_date, distance_miles }) => [new Date(start_date).getTime(), distance_miles]),
        yAxis: 1,
        dateFormat: 'MMM DD',
        color: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [[0, 'rgba(0,0,255,1)'], [1, 'rgba(0,0,55,1)']],
        },
        ...seriesDefaultConfig,
      },
      {
        name: 'Average HR',
        data: activities.map(({ start_date, average_heartrate }) => [new Date(start_date).getTime(), average_heartrate]),
        yAxis: 2,
        color: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [[0, '#f00'], [0.5, '#0f0'], [1, '#f00']],
        },
        ...seriesDefaultConfig,
      },
    ],
    xAxis: {
      crosshair: true,
      type: 'datetime',
      gridLineWidth: 1,
      gridLineColor: 'rgba(0,0,0,0.4)',
      labels: {
        style: {
          color: 'black'
        }
      }
    },
    yAxis: [
      {
        ...yAxisDefaultConfig,
        title: {
          enabled: enableYAxis,
          text: 'Avg Speed',
          style: {
            color: 'black'
          }
        },
        labels: {
          enabled: enableYAxis,
          format: '{value} mph',
          style: {
            color: 'black',
          },
        },
      },
      { // Secondary yAxis
        ...yAxisDefaultConfig,
        top: '33%',
        title: {
          enabled: enableYAxis,
          text: 'Distance',
          style: {
            color: 'blue',
          },
        },
        labels: {
          enabled: enableYAxis,
          format: '{value} mi',
          style: {
            color: 'blue',
          },
        },
        opposite: true,
      },
      {
        ...yAxisDefaultConfig,
        top: '66%',
        title: {
          enabled: enableYAxis,
          text: 'Avg HR',
          style: {
            color: 'black'
          }
        },
        tickInterval: 10,
        offset: 0,
        labels: {
          enabled: enableYAxis,
          format: '{value}',
          style: {
            color: 'black',
          },
        },
      },
    ],
    tooltip: {
      useHTML: true,
      animation: false,
      positioner: function () {
        return {
          // right aligned
          x: this.chart.chartWidth - this.label.width,
          y: 0 // align to title
        };
      },
      formatter: function () {
        const index = this.point.index;
        const activity = activities[index];
        return `
          <div class="text-right dls-white-bg pad border-1">
            <b>${dayjs(activity.start_date).format('MMM DD')}</b>
            <br />
            ${activity.name}
            <br />
            ${activity.distance_miles.toFixed(2)} miles
            <br /> 
            ${convertMetricSpeedToMPH(activity.average_speed).toFixed(2)} mph
            <br />
            ${activity.average_heartrate} bpm
          </div>
        `;
      },
      borderWidth: 0,
      backgroundColor: 'none',
      pointFormat: '{point.y}',
      headerFormat: '',
      shadow: false,
      style: {
        fontSize: '18px'
      },
    },
  }), [activities, enableYAxis]);

  return (
    <div style={{ height: 610 }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        allowChartUpdate={true}
      />
      <div className="flex full-width">
      </div>
    </div>
  );
};

export default SpeedChart;
