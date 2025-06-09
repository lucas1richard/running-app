<script lang="ts" setup>
import Highcharts from 'highcharts';
import { Chart } from 'highcharts-vue';
import variwide from 'highcharts/modules/variwide';
import gantt from 'highcharts/modules/gantt';
import { computed, onMounted, ref, toValue, useTemplateRef, watch, watchEffect, type Ref } from 'vue';
import getSmoothVal from '@/utils/getSmoothVal';
import calcEfficiencyFactor from '@/utils/calcEfficiencyFactor';
import { condenseZonesFromHeartRate, convertMetricSpeedToMPH, getDurationString } from '@/utils';
import roundToNearest from '@/utils/roundToNearest';
import { hrZonesBg } from '@/utils/colors/hrZones';
import { injectIsDarkMode } from '@/components/hooks/useIsDarkMode';
import { useActivitiesStore } from '@/stores/activities';
import getMinMax from '@/utils/getMinMax';
import useViewSize from '@/components/hooks/useViewSize';
import useSegments from './useSegments';
import getGradeColorAbs from './getGradeColorAbs';
import Surface from '@/components/DLS/Surface.vue';
import prColors from '@/utils/colors/prColors';

variwide(Highcharts);
gantt(Highcharts);

const prColorsArr = [
  { value: 0, color: prColors.gold.fill, borderColor: prColors.gold.stroke },
  { value: 1, color: prColors.gold.fill, borderColor: prColors.gold.stroke },
  { value: 2, color: 'rgba(192, 192, 192, 0.9)', borderColor: prColors.silver.stroke },
  { value: 3, color: 'rgba(205, 127, 50, 0.9)', borderColor: prColors.bronze.stroke },
  { color: 'white', borderColor: 'black' },
];

const chartHeight = 900;

const {
  id,
  averageSpeed,
  altitude,
  bestEfforts = [],
  data,
  velocity,
  grade,
  time,
  zones,
  laps,
  splitsMi,
  zonesBandsDirection,
  streamPins,
  updatePointer,
} = defineProps<{
  id: number;
  averageSpeed: number;
  altitude: number[];
  bestEfforts: { start_index: number; elapsed_time: number; pr_rank: number | null; name: string; }[];
  data: number[];
  velocity: number[];
  grade: number[];
  time: (number | null)[];
  zones: HeartZone;
  laps: { average_speed: number; elapsed_time: number; }[];
  splitsMi: { average_speed: number; elapsed_time: number; }[];
  zonesBandsDirection: 'xAxis' | 'yAxis' | 'none';
  streamPins: StreamPin[];
  updatePointer: (num: number) => void;
}>();
const activityStore = useActivitiesStore();
const viewSize = useViewSize();
const smoothAverageWindow = ref(20);
const latlngStream = activityStore.getStreamTypeData(id, 'latlng');
const highlightedSegment = ref(undefined);

// const addPin = useCallback(function(streamKey) {
//   dispatch(setStreamPin(id, streamKey, this.index, '', '', latlngStream[this.index]));
// }, [id, dispatch, latlngStream]);

const fullTime = computed<(number | null)[]>(() => {
  const maxTime = time[time.length - 1];
  const timeArr = new Array(maxTime).fill(0).map<number | null>((_, ix) => ix);
  for (let i = 0, j = 0; i < timeArr.length; i++) {
    if (time[j] === i) j++;
    else timeArr[i] = null;
  }
  return timeArr;
});

const yAxisBands = computed(() => [1, 2, 3, 4, 5].map((z, ix) => ({
  from: zones[`z${z}`],
  to: (zones[`z${z + 1}`] - 1) || 220,
  color: hrZonesBg[z],
  id: 'hrZoneBand',
})));

const smoothHeartRate = computed(
  () => getSmoothVal(fullTime.value, data, smoothAverageWindow.value)
);
const heartRateData = computed<[(number | null), number][]>(
  () => fullTime.value.filter((val) => typeof val === 'number')
    .map((val) => [val, smoothHeartRate.value[val]])
);
const altitudeData = computed<[(number | null), number][]>(
  () => fullTime.value.filter((val) => typeof val === 'number')
    .map((val) => [val, altitude[val]])
);
const smoothVelocity = computed(
  () => getSmoothVal(fullTime.value, velocity, smoothAverageWindow.value)
);
const velocityData = computed<[(number | null), number][]>(
  () => fullTime.value.filter((val) => typeof val === 'number').map((val) => [
    val,
    roundToNearest(convertMetricSpeedToMPH(smoothVelocity.value[val]), 100)
  ])
);
const efficiencyFactorData = computed(
  () => fullTime.value.filter((val) => typeof val === 'number').map((val) => [
    val,
    calcEfficiencyFactor(smoothVelocity.value[val], smoothHeartRate.value[val]),
  ])
);
const ids = computed(() => [id]);
const [segments] = useSegments(ids.value).value;

const bestEffortsData = computed(
  () => bestEfforts.map((val, ix) => ({
    start: fullTime[val.start_index],
    y: ix + 1,
    end: fullTime[val.start_index] + val.elapsed_time,
    color: (prColorsArr[val.pr_rank] || prColorsArr[prColorsArr.length - 1]).color,
    borderColor: (prColorsArr[val.pr_rank] || prColorsArr[prColorsArr.length - 1]).borderColor,
  }))
);

const hrzones = computed(
  () => condenseZonesFromHeartRate(zones, smoothHeartRate.value)
);

const chartRef = useTemplateRef('chartRef');

const xAxisBands = computed(() => hrzones.value.map((band, ix) => ({
  color: hrZonesBg[band.zone],
  id: `hrZoneBand-${ix}`,
  ...band
})));

const updateSmoothAverageWindow = (e) => {
  const val = parseInt(e.target.value, 10);
  if (val < 1 || val > time.length) return;

  const chart = chartRef.value?.chart;
  if (!chart) return;

  xAxisBands.value.forEach(({ id }) => chart.xAxis[0].removePlotBand(id));
  smoothAverageWindow.value = val;
};

// magnificationFactor is actually the scrollablePlotArea.minWidth from HighCharts
const magnificationFactor = ref(0);
const initialMagnificationFactor = ref(0);

onMounted(() => {
  magnificationFactor.value = chartRef.value?.chart.plotWidth || 0;
  initialMagnificationFactor.value = chartRef.value?.current?.chart.plotWidth || 0;
});

const addZoneBands = () => {
  const chart = chartRef.value?.chart;
  if (!chart) return;

  xAxisBands.value.forEach(({ id }) => chart.xAxis[0].removePlotBand(id));
  yAxisBands.value.forEach(({ id }) => chart.yAxis[0].removePlotBand(id));

  if (zonesBandsDirection === 'xAxis') {
    xAxisBands.value.forEach(band => chart.xAxis[0].addPlotBand(band));
  } else if (zonesBandsDirection === 'yAxis') {
    yAxisBands.value.forEach(band => chart.yAxis[0].addPlotBand(band));
  }
};

watchEffect(addZoneBands);
onMounted(addZoneBands);

// useEffect(() => {
//   if (chartRef.current?.chart) {
//     streamPins.forEach(({ stream_key, index }) => {
//       addXAxisPlotLine(index, 'magenta', chartRef);
//     });
//   }
//   // setPins(streamPins);
// }, [streamPins]);


const enableYAxisLabels = viewSize.value.gte('md');
const isSmall = viewSize.value.lte('sm');

const isDarkMode = injectIsDarkMode();
const contrastLabelColor = computed(() => {
  if (isDarkMode.value) return 'rgb(255,255,255)';
  return 'rgb(0,0,0)';
});

const options = computed<Highcharts.Options>(() => {
  const [hrMin, hrMax] = getMinMax(heartRateData.value);
  const [velMin, velMax] = getMinMax(velocityData.value);
  const [altMin, altMax] = getMinMax(altitudeData.value);
  const seriesDefaultConfig = ({
    type: 'area',
    states: {
      inactive: {
        opacity: 1
      },
      hover: {
        lineWidthPlus: 0,
      }
    },
    fillOpacity: 0.3,
    lineWidth: isSmall ? 2 : 3,
    animation: false,
  });

  return ({
    chart: {
      type: 'spline',
      height: chartHeight,
      alignThresholds: true,
      alignTicks: true,
      zooming: { type: 'x' },
      backgroundColor: 'transparent',
      scrollablePlotArea: { minWidth: magnificationFactor.value, scrollPositionX: 0 },
    },
    legend: { enabled: false },
    title: { text: '' },
    plotOptions: { connectEnds: false, connectNulls: false },
    series: [
      {
        ...seriesDefaultConfig,
        name: 'HR',
        streamKey: 'heartrate',
        data: heartRateData.value,
        yAxis: 0,
        color: 'red',
        fillOpacity: 0.1,
        tooltip: {
          valueSuffix: ' bpm',
          pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
        },
        point: {
          events: {
            // click() {
            //   addXAxisPlotLine(this.x, 'rgba(255, 0, 0, 0.5)', chartRef);
            //   addPin.apply(this, ['heartrate']);
            // },
            mouseOver() {
              updatePointer(this.index);
            }
          },
        },
      },
      {
        ...seriesDefaultConfig,
        name: 'Velocity',
        data: velocityData.value,
        yAxis: 1,
        fillOpacity: 0.1,
        color: contrastLabelColor.value,
        tooltip: {
          valueSuffix: ' mph',
          pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
        },
        point: {
          events: {
            // click() {
            //   addXAxisPlotLine(this.x, 'rgba(0, 0, 0, 0.5)', chartRef);
            //   addPin.apply(this, ['velocity_smooth']);
            // },
            mouseOver() {
              updatePointer(this.index);
            }
          },
        },
      },
      {
        ...seriesDefaultConfig,
        name: segments.name,
        data: segments.data,
        type: 'variwide',
        yAxis: 2,
        fillOpacity: 0.1,
        borderColor: isDarkMode.value === true ? 'rgba(144,144,144,1)' : 'rgba(0,0,0,1)',
        borderWidth: 3,
        dataLabels: {
          enabled: false,
        },
        color: isDarkMode.value === true ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        tooltip: {
          valueSuffix: ' mph',
          pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
        },
      },
      {
        ...seriesDefaultConfig,
        name: 'Elevation',
        data: altitudeData.value,
        yAxis: 3,
        fillOpacity: 0.9,
        color: {
          linearGradient: { x1: 0, x2: 1, y1: 0, y2: 0 },
          stops: getGradeColorAbs(grade, 0, 0, { lowestValueRgb: [0, 132, 255], midValueRgb: [0, 0, 0], highestValueRgb: [255, 0, 0] }),
        },
        tooltip: {
          pointFormatter: function () {
            const point = this;
            const series = this.series;
            return `
              <span style="color:${point.color}">\u25CF</span>
              ${series.name}: <b>${point.y} m</b>
              <br/>
              <span style="color:${point.color}">\u25CF</span>
              Grade: <b>${grade[point.index]}</b>
            `;
          },
        },
        point: {
          events: {
            // click() {
            //   addXAxisPlotLine(this.x, 'rgba(165, 42, 42, 0.5)', chartRef);
            //   addPin.apply(this, ['altitude']);
            // },
            mouseOver() {
              updatePointer(this.index);
            }
          },
        },
      },
      {
        ...seriesDefaultConfig,
        name: 'Best Efforts',
        type: 'gantt',
        data: bestEffortsData.value,
        yAxis: 4,
        fillOpacity: 0.1,
        borderWidth: 1,
        dataLabels: {
          enabled: true,
          animation: true,
          align: 'left',
          formatter() {
            const effort = bestEfforts[this.point.index];
            return `
                <span>${effort.name} - ${getDurationString(effort.elapsed_time)}</span>
            `;
          },
        },
        tooltip: {
          headerFormat: '<br />',
          pointFormatter() {
            const effort = bestEfforts[this.index];
            return `
              <span style="color:${this.color}">\u25CF</span> Distance: <b>${effort.name}</b><br/>
              <span style="color:${this.color}">\u25CF</span> Time: <b>${getDurationString(effort.elapsed_time)}</b><br/>
              <span style="color:${this.color}">\u25CF</span> Rank: <b>${effort.pr_rank}</b><br/>
            `;
          }
        },
        // point: {
        //   events: {
        //     click() {
        //       setHighlightedSegment((prev) => {
        //         const color = this.color === 'white' ? 'rgba(0,132,255,0.6)' : this.color;
        //         const next = { start: this.start, end: this.end, color, borderColor: this.borderColor };
        //         if (prev && prev.start === next.start && prev.end === next.end) return;
        //         return next;
        //       });
        //     },
        //     mouseOver() {
        //     }
        //   },
        // },
      },
      {
        ...seriesDefaultConfig,
        name: 'EF', // Efficiency Factor 
        streamKey: 'efficiency_factor',
        data: efficiencyFactorData.value,
        yAxis: 5,
        fillOpacity: 0.1,
        color: 'blue',
        tooltip: {
          valueSuffix: ' yards/beat',
          pointFormatter() {
            return `
              <span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${this.y.toFixed(2)} y/b</b><br/>
            `;
          },
        },
        point: {
          events: {
            click() {
              addXAxisPlotLine(this.x, 'rgba(0, 0, 255, 0.5)', chartRef);
              addPin.apply(this, ['efficiency_factor']);
            },
            mouseOver() {
              updatePointer(this.index);
            }
          },
        },
      },
    ],
    xAxis: {
      gridLineWidth: 2,
      alignTicks: false,
      tickInterval: isSmall ? 600 : 240,
      minorGridLineWidth: 1,
      minorTicks: true,
      minorTickInterval: isSmall ? undefined : 60,
      minorTickLength: 4,
      type: 'linear',
      minorGridLineColor: 'rgba(0,0,0,0.3)',
      gridLineColor: 'rgba(0,0,0,0.4)'
    },
    yAxis: [
      { // Primary yAxis
        height: '25%',
        top: '0%',
        min: hrMin,
        max: hrMax,
        id: 'hr',
        labels: {
          style: { color: 'red' },
          enabled: enableYAxisLabels,
        },
        title: {
          text: 'Heart Rate', style: { color: 'red', fontSize: '1.25rem' },
          enabled: enableYAxisLabels,
        },
      },
      { // Secondary yAxis
        gridLineWidth: 1,
        height: '25%',
        top: '25%',
        min: velMin,
        max: velMax,
        id: 'vel',
        title: { enabled: enableYAxisLabels, text: 'Velocity', style: { color: contrastLabelColor.value, fontSize: '1.25rem' } },
        labels: { enabled: enableYAxisLabels, format: '{value} mph', style: { color: contrastLabelColor.value } },
        opposite: true,
      },
      { // Secondary yAxis
        gridLineWidth: 0,
        height: '15%',
        top: '10%',
        id: 'laps',
        // min: lapsData.length < 2 ? splitsMin * 0.97 : lapsMin * 0.97,
        title: { enabled: enableYAxisLabels, text: segments.name, style: { color: contrastLabelColor.value, fontSize: '1.25rem' } },
        labels: { enabled: enableYAxisLabels, format: '{value} mph', style: { color: contrastLabelColor.value } },
        opposite: true,
      },
      { // Secondary yAxis
        gridLineWidth: 1,
        height: '25%',
        top: '50%',
        offset: 0,
        min: altMin,
        max: altMax,
        id: 'alt',
        title: { enabled: enableYAxisLabels, text: 'Elevation', style: { color: 'brown', fontSize: '1.25rem' } },
        labels: { enabled: enableYAxisLabels, format: '{value}', style: { color: 'brown' } },
        opposite: false,
      },
      { // Secondary yAxis
        gridLineWidth: 0,
        height: '25%',
        top: '75%',
        offset: 0,
        id: 'bestEfforts',
        title: { enabled: enableYAxisLabels, text: 'Best Efforts', style: { color: 'gold', fontSize: '1.25rem' } },
        labels: { enabled: enableYAxisLabels, format: '{value}', style: { color: 'gold' } },
        opposite: true,
      },
      { // Secondary yAxis
        gridLineWidth: 0,
        height: '15%',
        top: '35%',
        offset: 0,
        id: 'EfficiencyFactor',
        title: { enabled: enableYAxisLabels, text: 'Efficiency Factor', style: { color: 'blue', fontSize: '1.25rem' } },
        labels: { enabled: enableYAxisLabels, format: '{value}', style: { color: 'blue' } },
        opposite: false,
      },
    ]
  });
});
</script>

<template>
  <Surface variant="foreground" class="card pad">
    <Chart :options="options" :highcharts="Highcharts" ref="chartRef" />
  </Surface>
</template>