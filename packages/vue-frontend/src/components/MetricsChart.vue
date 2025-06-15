<script lang="ts" setup>

import { convertMetricSpeedToMPH } from '@/utils';
import calcEfficiencyFactor from '@/utils/calcEfficiencyFactor';
import { computed } from 'vue';
import Surface from './DLS/Surface.vue';
import { Chart } from 'highcharts-vue';
import highcharts, { type Options } from 'highcharts';
import dayjs from 'dayjs';
import { injectIsDarkMode } from './hooks/useIsDarkMode';

// const viewSize = useViewSize();

const { activities: activitiesProp } = defineProps<{
  activities: Activity[];
}>();

const activities = computed(() => {
  const s = [...activitiesProp];
  s.sort(((a, b) => new Date(a.start_date_local).getTime() - new Date(b.start_date_local).getTime()));
  return s;
});
const enableYAxis = true;
const isDarkMode = injectIsDarkMode();
const contrastColor = computed(() => isDarkMode.value ? 'white' : 'black');
const gridColor = computed(() => isDarkMode.value ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)');

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
};

const yAxisDefaultConfig = {
  crosshair: true,
  // minorTickInterval: 'auto',
  tickInterval: 1,
  minorGridLineColor: 'transparent',
  height: '25%',
  opposite: false,
} satisfies Highcharts.YAxisOptions;

const options = computed(() => {
  const series = [
    {
      name: 'Speed',
      data: activities.value.map(({ start_date, average_speed }) => [new Date(start_date).getTime(), convertMetricSpeedToMPH(average_speed)]),
      yAxis: 0,
      color: {
        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        stops: [[0, '#0f0'], [1, '#f00']],
      },
      ...seriesDefaultConfig,
    },
    {
      name: 'Distance',
      data: activities.value.map(({ start_date, distance_miles }) => [new Date(start_date).getTime(), distance_miles]),
      yAxis: 1,
      dateFormat: 'MMM DD',
      // color: {
      //   linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
      //   stops: [[0, 'rgba(0,0,255,1)'], [1, 'rgba(0,0,55,1)']],
      // },
      color: contrastColor.value,
      ...seriesDefaultConfig,
    },
    {
      name: 'Average HR',
      data: activities.value.map(({ start_date, average_heartrate }) => [new Date(start_date).getTime(), average_heartrate]),
      yAxis: 2,
      color: {
        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        stops: [[0, '#f00'], [0.5, '#0f0'], [1, '#f00']],
      },
      ...seriesDefaultConfig,
    },
    {
      name: 'Efficiency Factor',
      data: activities.value.map(({ start_date, average_heartrate, average_speed }) => [new Date(start_date).getTime(), calcEfficiencyFactor(average_speed, average_heartrate)]),
      yAxis: 3,
      color: 'blue',
      ...seriesDefaultConfig,
    },
  ];
  return ({
  type: 'line',
    
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
  series,
  xAxis: {
    crosshair: true,
    type: 'datetime',
    gridLineWidth: 1,
    gridLineColor: gridColor.value,
    labels: {
      style: {
        color: contrastColor.value
      }
    }
  },
  yAxis: [
    {
      ...yAxisDefaultConfig,
      gridLineColor: gridColor.value,
      title: {
        enabled: enableYAxis,
        text: 'Avg Speed',
        style: {
          color: contrastColor.value
        }
      },
      labels: {
        enabled: enableYAxis,
        format: '{value} mph',
        style: {
          color: contrastColor.value,
        },
      },
    },
    { // Secondary yAxis
      ...yAxisDefaultConfig,
      gridLineColor: gridColor.value,
      top: '25%',
      title: {
        enabled: enableYAxis,
        text: 'Distance',
        style: {
          color: contrastColor.value,
        },
      },
      labels: {
        enabled: enableYAxis,
        format: '{value} mi',
        style: {
          color: contrastColor.value,
        },
      },
      opposite: true,
    },
    {
      ...yAxisDefaultConfig,
      gridLineColor: gridColor.value,
      top: '50%',
      title: {
        enabled: enableYAxis,
        text: 'Avg HR',
        style: {
          color: contrastColor.value
        }
      },
      tickInterval: 10,
      offset: 0,
      labels: {
        enabled: enableYAxis,
        format: '{value}',
        style: {
          color: contrastColor.value,
        },
      },
    },
    {
      ...yAxisDefaultConfig,
      gridLineColor: gridColor.value,
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
      const activity = activities.value[index];
      return `
          <div class="text-body foreground text-right card pad border-1">
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
} satisfies Options)});
</script>

<template>
  <Surface class="pad card">
    <Chart :options="options" :highcharts="highcharts" />
  </Surface>
</template>