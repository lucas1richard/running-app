import dayjs from 'dayjs';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { convertMetricSpeedToMPH } from '../utils';
import { useMemo } from 'react';

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
  height: '50%',
  opposite: false,
}

const SpeedChart = ({ activities: actProp }) => {
  const activities = useMemo(
    () => actProp.filter(({ start_date }) => dayjs(start_date).isAfter(dayjs().subtract(1, 'year'))).reverse(),
    [actProp]
  );

  /** @type {Highcharts.Options} */
  const options = useMemo(() => ({
    chart: {
      type: 'line',
      height: 400,
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
          text: 'Avg Speed',
          style: {
            color: 'black'
          }
        },
        labels: {
          format: '{value} mph',
          style: {
            color: 'black',
          },
        },
      },
      { // Secondary yAxis
        ...yAxisDefaultConfig,
        top: '50%',
        title: {
          text: 'Distance',
          style: {
            color: 'blue',
          },
        },
        labels: {
          format: '{value} mi',
          style: {
            color: 'blue',
          },
        },
        opposite: true,
      }
    ],
    tooltip: {
      useHTML: true,
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
            ${activities[index].distance_miles.toFixed(2)} miles
            <br /> 
            ${convertMetricSpeedToMPH(activities[index].average_speed).toFixed(2)} mph
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
  }), [activities]);

  return (
    <div style={{ height: 410 }}>
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
