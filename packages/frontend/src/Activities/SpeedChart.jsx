import dayjs from 'dayjs';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { convertMetersToMiles, convertMetricSpeedToMPH, convertSpeedToPace, getDuration } from '../utils';
import { useMemo } from 'react';

const SpeedChart = ({ activities: actProp }) => {

  const activities = actProp.filter(({ start_date }) => dayjs(start_date).isAfter(dayjs().subtract(1, 'year')));

  /** @type {Highcharts.Options} */
  const options = useMemo(() => ({
    chart: {
      type: 'line',
      height: 400,
      // width: 600,
    },
    title: {
      text: 'Average Speed Over Time',
      align: 'left',
      margin: 20,
      x: 30
    },
    zooming: 'x',
    series: [
      {
        name: 'Speed',
        data: activities.map(({ start_date, average_speed }) => [new Date(start_date).getTime(), convertMetricSpeedToMPH(average_speed)]).reverse(),
        yAxis: 0,
        color: 'black',
        lineWidth: 2,
        animation: false,
      },
      {
        name: 'Distance',
        data: activities.map(({ start_date, distance }) => [new Date(start_date).getTime(), convertMetersToMiles(distance)]).reverse(),
        yAxis: 0,
        dateFormat: 'MMM DD',
        color: 'blue',
        lineWidth: 2,
        animation: false,
      },
    ].filter(Boolean),
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
        crosshair: true,
        gridLineWidth: 1,
        title: {
          text: 'Speed',
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
        opposite: false,
      }
    ],
    tooltip: {
      positioner: function () {
        return {
            // right aligned
            x: this.chart.chartWidth - this.label.width,
            y: 10 // align to title
        };
    },
      formatter: function () {
        return `
          <b>${dayjs(this.x).format('MMM DD')}</b>
          <br>
          ${this.y.toFixed(2)} ${this.series.name === 'Speed' ? 'mph' : 'miles'}
          <br>
          ${getDuration(convertSpeedToPace(convertMetricSpeedToMPH(this.y))).join(' ')} /mi
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
