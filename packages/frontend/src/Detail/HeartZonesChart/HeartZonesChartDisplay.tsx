import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import variwide from 'highcharts/modules/variwide';
import gantt from 'highcharts/modules/gantt';
import { hrZonesBg, hrZonesText } from '../../colors/hrZones';
import getSmoothVal from './getSmoothVal';
import addXAxisPlotLine, { removeXAxisPlotLine } from './addXAxisPlotline';
import useMinMax from './useMinMax';
import { prColors } from '../../Common/colors';
import RouteMap from '../RouteMap';
import calcEfficiencyFactor from '../../utils/calcEfficiencyFactor';
import roundToNearest from '../../utils/roundToNearest';
import {
  condenseZonesFromHeartRate,
  convertMetricSpeedToMPH,
  getDurationString,
} from '../../utils';
import getGradeColorAbs from './getGradeColorAbs';
import useSegments from './useSegments';
import { Button, Flex, Grid } from '../../DLS';
import useViewSize from '../../hooks/useViewSize';
import { useDispatch } from 'react-redux';
import { deleteStreamPin, setStreamPin } from '../../reducers/activities-actions';
import StreamPinForm from './StreamPinForm';
import { useAppSelector } from '../../hooks/redux';
import { selectStreamTypeData } from '../../reducers/activities';

variwide(Highcharts);
gantt(Highcharts);

const prColorsArr = [
  { value: 0, color: prColors.gold.fill, borderColor: prColors.gold.stroke },
  { value: 1, color: prColors.gold.fill, borderColor: prColors.gold.stroke },
  { value: 2, color: 'rgba(192, 192, 192, 0.9)', borderColor: prColors.silver.stroke },
  { value: 3, color: 'rgba(205, 127, 50, 0.9)', borderColor: prColors.bronze.stroke },
  { color: 'white', borderColor: 'black' },
]

const chartHeight = 900;

type Props = {
  id: number;
  averageSpeed: number;
  altitude: number[];
  bestEfforts: { start_index: number; elapsed_time: number; pr_rank: number; name: string }[];
  data: number[];
  velocity: number[];
  grade: number[];
  time: number[];
  zones: HeartZone;
  laps: { average_speed: number; elapsed_time: number }[];
  splitsMi: { average_speed: number; elapsed_time: number }[];
  zonesBandsDirection: 'xAxis' | 'yAxis' | 'none';
  streamPins: StreamPin[];
}

const HeartZonesChartDisplay: React.FC<Props> = ({
  id,
  averageSpeed,
  altitude,
  bestEfforts,
  data,
  velocity,
  time,
  grade,
  streamPins,
  zones,
  zonesBandsDirection,
}) => {
  const viewSize = useViewSize();
  const dispatch = useDispatch();
  const [smoothAverageWindow, setSmoothAverageWindow] = useState(20);
  const latlngStream = useAppSelector((state) => selectStreamTypeData(state, id, 'latlng'));
  const [latlngPointer, setLatlngPointer] = useState(0);
  const [highlightedSegment, setHighlightedSegment] = useState(undefined);

  const addPin = useCallback(function(streamKey) {
    dispatch(setStreamPin(id, streamKey, this.index, '', '', latlngStream[this.index]));
  }, [id, dispatch, latlngStream]);

  const fullTime = useMemo(() => {
    const maxTime = time[time.length - 1];
    const timeArr = new Array(maxTime).fill(0).map((_, ix) => ix);
    for (let i = 0, j = 0; i < timeArr.length; i++) {
      if (time[j] === i) j++;
      else timeArr[i] = null;
    }
    return timeArr;
  }, [time]);

  const yAxisBands = useMemo(() => [1,2,3,4,5].map((z, ix) => ({
    from: zones[`z${z}`],
    to: (zones[`z${z + 1}`] - 1) || 220,
    color: hrZonesBg[z],
    id: 'hrZoneBand',
  })), [zones]);

  const smoothHeartRate = useMemo(
    () => getSmoothVal(fullTime, data, smoothAverageWindow),
    [fullTime, data, smoothAverageWindow]
  );
  const heartRateData = useMemo<[number, number][]>(
    () => fullTime.map((val) => [val, smoothHeartRate[val]]),
    [smoothHeartRate, fullTime]
  );
  const altitudeData = useMemo<[number, number][]>(
    () => fullTime.map((val) => [val, altitude[val]]),
    [altitude, fullTime]
  );
  const smoothVelocity = useMemo(
    () => getSmoothVal(fullTime, velocity, smoothAverageWindow),
    [fullTime, velocity, smoothAverageWindow]
  );
  const velocityData = useMemo<[number, number][]>(
    () => fullTime.map((val) => [
      val,
      roundToNearest(convertMetricSpeedToMPH(smoothVelocity[val]), 100)
    ]),
    [smoothVelocity, fullTime]
  );
  const efficiencyFactorData = useMemo(
    () => fullTime.map((val) => [
      val,
      calcEfficiencyFactor(smoothVelocity[val], smoothHeartRate[val]),
    ]),
    [fullTime, smoothVelocity, smoothHeartRate]
  );
  const ids = useMemo(() => [id], [id]);
  const [segments] = useSegments(ids);

  const bestEffortsData = useMemo(
    () => bestEfforts.map((val, ix) => ({
      start: fullTime[val.start_index],
      y: ix + 1,
      end: fullTime[val.start_index] + val.elapsed_time,
      color: (prColorsArr[val.pr_rank] || prColorsArr[prColorsArr.length - 1]).color,
      borderColor: (prColorsArr[val.pr_rank] || prColorsArr[prColorsArr.length - 1]).borderColor,
    })),
    [bestEfforts, fullTime]
  );
  
  const hrzones = useMemo(
    () => condenseZonesFromHeartRate(zones, smoothHeartRate),
    [zones, smoothHeartRate]
  );

  const chartRef = useRef<{ chart: Highcharts.Chart; container: React.RefObject<HTMLDivElement> }>();

  const xAxisBands = useMemo(() => hrzones.map((band, ix) => ({
    color: hrZonesBg[band.zone],
    id: `hrZoneBand-${ix}`,
    ...band
  })), [hrzones]);

  const updateSmoothAverageWindow = useCallback((e) => {
    const val = parseInt(e.target.value, 10);
    if (val < 1 || val > time.length) return;

    const chart = chartRef.current?.chart;
    if (!chart) return;

    xAxisBands.forEach(({ id }) => chart.xAxis[0].removePlotBand(id));
    setSmoothAverageWindow(val);
  }, [time.length, xAxisBands]);

  // magnificationFactor is actually the scrollablePlotArea.minWidth from HighCharts
  const [magnificationFactor, setMagnificationFactor] = useState(0);
  const [initialMagnificationFactor, setInitialMagnificationFactor] = useState(0);

  useEffect(() => {
    setMagnificationFactor(chartRef.current?.chart.plotWidth || 0);
    setInitialMagnificationFactor(chartRef.current?.chart.plotWidth || 0);
  }, []);

  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (!chart) return;

    xAxisBands.forEach(({ id }) => chart.xAxis[0].removePlotBand(id));
    yAxisBands.forEach(({ id }) => chart.yAxis[0].removePlotBand(id));

    if (zonesBandsDirection === 'xAxis') {
      xAxisBands.forEach(band => chart.xAxis[0].addPlotBand(band));
    } else if (zonesBandsDirection === 'yAxis') {
      yAxisBands.forEach(band => chart.yAxis[0].addPlotBand(band));
    }
  }, [xAxisBands, yAxisBands, zonesBandsDirection, smoothAverageWindow]);

  useEffect(() => {
    if (chartRef.current?.chart) {
      streamPins.forEach(({ stream_key, index }) => {
        addXAxisPlotLine(index, 'magenta', chartRef);
      });
    }
    // setPins(streamPins);
  }, [streamPins]);
  
  const [hrMin, hrMax] = useMinMax(heartRateData);
  const [velMin, velMax] = useMinMax(velocityData);
  const [altMin, altMax] = useMinMax(altitudeData);

  const enableYAxisLabels = viewSize.gte('md');
  const isSmall = viewSize.lte('sm');

  const seriesDefaultConfig = useMemo(() => ({
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
  }), [isSmall]);

  const options = useMemo(() => 
    /** @type {Highcharts.Options} */
    ({
    chart: {
      type: 'spline',
      height: chartHeight,
      alignThresholds: true,
      alignTicks: true,
      zooming: { type: 'x' },
      scrollablePlotArea: { minWidth: magnificationFactor, scrollPositionX: 0 },
    },
    legend: { enabled: false },
    title: { text: '' },
    plotOptions: { connectEnds: false, connectNulls: false },
    series: [
      {
        ...seriesDefaultConfig,
        name: 'HR',
        streamKey: 'heartrate',
        data: heartRateData,
        yAxis: 0,
        color: 'red',
        fillOpacity: 0.1,
        tooltip: {
          valueSuffix: ' bpm',
          pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
        },
        point: {
          events: {
            click() {
              addXAxisPlotLine(this.x, 'rgba(255, 0, 0, 0.5)', chartRef);
              addPin.apply(this, ['heartrate']);
            },
            mouseOver() {
              setLatlngPointer(this.index);
            }
          },
        },
      },
      {
        ...seriesDefaultConfig,
        name: 'Velocity',
        data: velocityData,
        yAxis: 1,
        fillOpacity: 0.1,
        color: 'black',
        tooltip: {
          valueSuffix: ' mph',
          pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
        },
        point: {
          events: {
            click() {
              addXAxisPlotLine(this.x, 'rgba(0, 0, 0, 0.5)', chartRef);
              addPin.apply(this, ['velocity_smooth']);
            },
            mouseOver() {
              setLatlngPointer(this.index);
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
        borderColor: 'rgba(0,0,0, 1)',
        borderWidth: 3,
        dataLabels: {
          enabled: false,
        },
        color: 'rgba(0,0,0, 0.1)',
        tooltip: {
          valueSuffix: ' mph',
          pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
        },
      },
      {
        ...seriesDefaultConfig,
        name: 'Elevation',
        data: altitudeData,
        yAxis: 3,
        fillOpacity: 0.9,
        color: {
          linearGradient: { x1: 0, x2: 1, y1: 0, y2: 0 },
          stops: getGradeColorAbs(grade, 0, 0, { lowestValueRgb: [0, 132, 255], midValueRgb: [0, 0, 0], highestValueRgb: [255, 0, 0] }),
        },
        tooltip: {
          pointFormatter: function() {
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
            click() {
              addXAxisPlotLine(this.x, 'rgba(165, 42, 42, 0.5)', chartRef);
              addPin.apply(this, ['altitude']);
            },
            mouseOver() {
              setLatlngPointer(this.index);
            }
          },
        },
      },
      {
        ...seriesDefaultConfig,
        name: 'Best Efforts',
        type: 'gantt',
        data: bestEffortsData,
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
        point: {
          events: {
            click() {
              setHighlightedSegment((prev) => {
                const color = this.color === 'white' ? 'rgba(0,132,255,0.6)' : this.color;
                const next = { start: this.start, end: this.end, color, borderColor: this.borderColor };
                if (prev && prev.start === next.start && prev.end === next.end) return;
                return next;
              });
            },
            mouseOver() {
            }
          },
        },
      },
      {
        ...seriesDefaultConfig,
        name: 'EF', // Efficiency Factor 
        streamKey: 'efficiency_factor',
        data: efficiencyFactorData,
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
              setLatlngPointer(this.index);
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
        title: { enabled: enableYAxisLabels, text: 'Velocity', style: { color: 'black', fontSize: '1.25rem' } },
        labels: { enabled: enableYAxisLabels, format: '{value} mph', style: { color: 'black' } },
        opposite: true,
      },
      { // Secondary yAxis
        gridLineWidth: 0,
        height: '15%',
        top: '10%',
        id: 'laps',
        // min: lapsData.length < 2 ? splitsMin * 0.97 : lapsMin * 0.97,
        title: { enabled: enableYAxisLabels, text: segments.name, style: { color: 'black', fontSize: '1.25rem' } },
        labels: { enabled: enableYAxisLabels, format: '{value} mph', style: { color: 'black' } },
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
  }), [isSmall, seriesDefaultConfig, magnificationFactor, heartRateData, velocityData, segments.name, segments.data, altitudeData, grade, bestEffortsData, efficiencyFactorData, hrMin, hrMax, enableYAxisLabels, velMin, velMax, altMin, altMax, addPin, bestEfforts]);

  return (
    <Grid
      templateColumns="1fr"
      templateColumnsXl="3fr 1fr"
    >
      <div className="flex-item-grow">
        <div>
          <label>
            Smooth Average Window (seconds):{' '}
            <input
              type="number"
              min={1}
              max={time.length}
              value={smoothAverageWindow}
              onChange={updateSmoothAverageWindow}
            />
          </label>
        </div>
        <div>
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
            allowChartUpdate={true}
            ref={chartRef}
          />
        </div>
        <div className="flex full-width">
          {hrzones.map(({ zone, from, to }) => (
            <div
              key={`${zone}-${from}-${to}`}
              style={{
                backgroundColor: hrZonesText[zone],
                height: 10,
                width: `${100 * ((to - from) / data.length)}%`,
              }}
            >
            </div>
          ))}
        </div>
        <Flex alignItems='center' marginT={1}>
          <label htmlFor="magnificationFactor-range">Magnification: </label>
          <div className="flex-item-grow margin-l">
            {enableYAxisLabels && (
              <>
                <input
                  type="range"
                  id="magnificationFactor-range"
                  min={initialMagnificationFactor}
                  max={initialMagnificationFactor * 10}
                  value={magnificationFactor}
                  onChange={(e) => setMagnificationFactor(parseInt(e.target.value, 10))}
                  className="flex-item-grow"
                  draggable={false}
                  about='Magnification factor for the chart'
                />
                <div className="flex flex-justify-between">
                  {[1,2,3,4,5,6,7,8,9,10].map((val) => (
                    <Button key={val} onClick={() => setMagnificationFactor(initialMagnificationFactor * val)}>
                      {val}x
                    </Button>
                  ))}
                </div>
              </>
            )}
            {!enableYAxisLabels && (
              <div>
                <select onChange={(ev) => setMagnificationFactor(initialMagnificationFactor * Number(ev.target.value))}>
                  {[1,2,3,4,5,6,7,8,9,10].map((val) => (
                    <option key={val} value={val}>
                      {val}x
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Flex>
        <div>
          {streamPins.map((pin) => (
            <div key={pin.id}>
              <StreamPinForm pin={pin} />
              <Button
                onClick={() => {
                  dispatch(deleteStreamPin(pin.id, id));
                  removeXAxisPlotLine(pin.index, chartRef);
                }}
              >
                Remove Plotline at {pin.index} seconds
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-item-grow">
        <RouteMap
          id={id}
          pointer={latlngPointer}
          segments={segments.data}
          velocity={smoothVelocity}
          pins={streamPins}
          highlightedSegment={highlightedSegment}
          smoothAverageWindow={smoothAverageWindow}
          averageSpeed={convertMetricSpeedToMPH(averageSpeed)}
        />
      </div>
    </Grid>
  );
};

export default HeartZonesChartDisplay;
