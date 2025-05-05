import React, { memo } from 'react';
import dayjs from 'dayjs';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { convertMetricSpeedToMPH } from '../utils';
import { useMemo } from 'react';
import useViewSize from '../hooks/useViewSize';
import calcEfficiencyFactor from '../utils/calcEfficiencyFactor';
import Surface from '../DLS/Surface';
import useDarkReaderMode from '../hooks/useDarkReaderMode';

const seriesDefaultConfig = {
  type: 'line',
  states: {
    inactive: {
      opacity: 1
    },
    hover: {
      lineWidthPlus: 0,
    },
  },
  lineWidth: 4,
  animation: false,
} satisfies Highcharts.SeriesLineOptions;

const yAxisDefaultConfig = {
  crosshair: true,
  // minorTickInterval: 'auto',
  tickInterval: 1,
  minorGridLineColor: 'transparent',
  height: '25%',
  opposite: false,
} satisfies Highcharts.YAxisOptions;

type SpeedChartProps = {
  activities: Activity[];
}

const SpeedChart: React.FC<SpeedChartProps> = ({ activities: activitiesProp }) => {
  const viewSize = useViewSize();

  const activities = useMemo(() => {
    const s = [...activitiesProp]
    s.sort(((a, b) => new Date(a.start_date_local).getTime() - new Date(b.start_date_local).getTime()));
    return s;
  }, [activitiesProp]);

  const enableYAxis = viewSize.gte('md');
  const isDarkMode = useDarkReaderMode();
  const contrastColor = isDarkMode ? 'white' : 'black';
  const gridColor = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  const options = useMemo<Highcharts.Options>(() =>
    ({
    chart: {
      type: 'line',
      height: 450,
      backgroundColor: 'transparent',
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
        // color: {
        //   linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        //   stops: [[0, 'rgba(0,0,255,1)'], [1, 'rgba(0,0,55,1)']],
        // },
        color: contrastColor,
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
      {
        name: 'Efficiency Factor',
        data: activities.map(({ start_date, average_heartrate, average_speed }) => [new Date(start_date).getTime(), calcEfficiencyFactor(average_speed, average_heartrate)]),
        yAxis: 3,
        color: 'blue',
        ...seriesDefaultConfig,
      },
    ],
    xAxis: {
      crosshair: true,
      type: 'datetime',
      gridLineWidth: 1,
      gridLineColor: gridColor,
      labels: {
        style: {
          color: contrastColor
        }
      }
    },
    yAxis: [
      {
        ...yAxisDefaultConfig,
        gridLineColor: gridColor,
        title: {
          enabled: enableYAxis,
          text: 'Avg Speed',
          style: {
            color: contrastColor
          }
        },
        labels: {
          enabled: enableYAxis,
          format: '{value} mph',
          style: {
            color: contrastColor,
          },
        },
      },
      { // Secondary yAxis
        ...yAxisDefaultConfig,
        gridLineColor: gridColor,
        top: '25%',
        title: {
          enabled: enableYAxis,
          text: 'Distance',
          style: {
            color: contrastColor,
          },
        },
        labels: {
          enabled: enableYAxis,
          format: '{value} mi',
          style: {
            color: contrastColor,
          },
        },
        opposite: true,
      },
      {
        ...yAxisDefaultConfig,
        gridLineColor: gridColor,
        top: '50%',
        title: {
          enabled: enableYAxis,
          text: 'Avg HR',
          style: {
            color: contrastColor
          }
        },
        tickInterval: 10,
        offset: 0,
        labels: {
          enabled: enableYAxis,
          format: '{value}',
          style: {
            color: contrastColor,
          },
        },
      },
      {
        ...yAxisDefaultConfig,
        gridLineColor: gridColor,
        top: '75%',
        title: {
          enabled: enableYAxis,
          text: 'Efficiency Factor',
          style: {
            color: 'blue'
          }
        },
        tickInterval: 0.1,
        offset: 0,
        labels: {
          enabled: enableYAxis,
          format: '{value}',
          style: {
            color: 'blue',
          },
        },
        opposite: true,
      },
    ],
    tooltip: {
      useHTML: true,
      animation: false,
      positioner: function () {
        return {
          // @ts-ignore -- label is indeed there
          x: this.chart.chartWidth - this.label.width, // right aligned
          y: 0 // align to title
        };
      },
      formatter: function () {
        const index = this.point.index;
        const activity = activities[index];
        return `
          <div class="text-right dls-white-bg pad border-1">
            <b>${dayjs(activity.start_date).format('DD MMM YYYY')}</b>
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
  }), [isDarkMode, activities, enableYAxis]);

  return (
    <Surface>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        allowChartUpdate={true}
      />
    </Surface>
  );
};

export default memo(SpeedChart);
