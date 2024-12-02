import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import variwide from 'highcharts/modules/variwide';
import gantt from 'highcharts/modules/gantt';
import { condenseZonesFromHeartRate, convertMetricSpeedToMPH, getDuration } from '../../utils';
import { hrZonesBg, hrZonesText } from '../../colors/hrZones';
import getSmoothVal from './getSmoothVal';
import addXAxisPlotLine from './addXAxisPlotline';
import useMinMax from './useMinMax';
import { prColors } from '../../Common/colors';
import RouteMap from '../RouteMap';
import calcEfficiencyFactor from '../../utils/calcEfficiencyFactor';

variwide(Highcharts);
gantt(Highcharts);

const prColorsArr = [
  { value: 0, color: prColors.gold.fill, borderColor: prColors.gold.stroke },
  { value: 1, color: prColors.gold.fill, borderColor: prColors.gold.stroke },
  { value: 2, color: 'rgba(192, 192, 192, 0.9)', borderColor: prColors.silver.stroke },
  { value: 3, color: 'rgba(205, 127, 50, 0.9)', borderColor: prColors.bronze.stroke },
  { color: 'white', borderColor: 'black' },
]

const seriesDefaultConfig = {
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
  lineWidth: 3,
  animation: false,
};

const chartHeight = 900;

const HeartZonesChartDisplay = ({
  id,
  altitude,
  bestEfforts,
  title,
  data,
  latlng,
  velocity,
  time,
  zones,
  width,
  laps,
  splitsMi,
  zonesBandsDirection,
}) => {
  const [smoothAverageWindow, setSmoothAverageWindow] = useState(20);
  const [plotLines, setPlotLines] = useState([]);
  const [latlngPointer, setLatlngPointer] = useState(0);

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
  const heartRateData = useMemo(
    () => fullTime.map((val) => [val, smoothHeartRate[val]]),
    [smoothHeartRate, fullTime]
  );
  const altitudeData = useMemo(
    () => fullTime.map((val) => [val, altitude[val]]),
    [altitude, fullTime]
  );
  const smoothVelocity = useMemo(
    () => getSmoothVal(fullTime, velocity, smoothAverageWindow),
    [fullTime, velocity, smoothAverageWindow]
  );
  const velocityData = useMemo(
    () => fullTime.map((val) => [val, convertMetricSpeedToMPH(smoothVelocity[val])]),
    [smoothVelocity, fullTime]
  );
  const efficiencyFactorData = useMemo(
    () => fullTime.map((val) => [
      val,
      calcEfficiencyFactor(smoothVelocity[val], smoothHeartRate[val]),
    ]),
    [fullTime, smoothVelocity, smoothHeartRate]
  );
  const lapsData = useMemo(
    () => {
      let offset = 0;
      return laps.map((val, ix) => {
        const datum = [
          offset,
          convertMetricSpeedToMPH(val.average_speed),
          val.elapsed_time
        ];
        offset += val.elapsed_time;
        return datum;
      })},
    [laps]
  );
  const splitsMiData = useMemo(
    () => {
      let offset = 0;
      return splitsMi.map((val, ix) => {
        const datum = [
          offset,
          val.average_speed,
          val.elapsed_time
        ];
        offset += val.elapsed_time;
        return datum;
      })},
    [splitsMi]
  );

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
    () => condenseZonesFromHeartRate(zones, smoothHeartRate, fullTime),
    [zones, smoothHeartRate, fullTime]
  );

  /** @type {React.MutableRefObject<{ chart: Highcharts.Chart }>} */
  const chartRef = useRef();

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
  }, [chartRef.current]);

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

  const [hrMin, hrMax] = useMinMax(heartRateData);
  const [velMin, velMax] = useMinMax(velocityData);
  const [altMin, altMax] = useMinMax(altitudeData);
  const [splitsMin] = useMinMax(splitsMiData);
  const [lapsMin] = useMinMax(lapsData);

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
    title: { text: title },
    plotOptions: { connectEnds: false, connectNulls: false },
    series: [
      {
        ...seriesDefaultConfig,
        name: 'HeartRate',
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
              addXAxisPlotLine(this.x, 'rgba(255, 0, 0, 0.5)', chartRef, setPlotLines);
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
          valueSuffix: ' bpm',
          pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
        },
        point: {
          events: {
            click() {
              addXAxisPlotLine(this.x, 'rgba(0, 0, 0, 0.5)', chartRef, setPlotLines)
            },
            mouseOver() {
              setLatlngPointer(this.index);
            }
          },
        },
      },
      {
        ...seriesDefaultConfig,
        name: lapsData.length < 2 ? 'Mile Split' : 'Laps',
        type: 'variwide',
        data: lapsData.length < 2 ? splitsMiData : lapsData,
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
        color: 'rgba(165, 42, 42, 0.5)',
        tooltip: {
          valueSuffix: ' m',
          pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
        },
        point: {
          events: {
            click() {
              addXAxisPlotLine(this.x, 'rgba(165, 42, 42, 0.5)', chartRef, setPlotLines)
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
            return `
                <span>${bestEfforts[this.point.index].name} - ${getDuration(bestEfforts[this.point.index].elapsed_time).map(([num, str]) => `${num}${str}`).join(' ')}</span>
            `;
          },
        },
        tooltip: {
          headerFormat: '<br />',
          pointFormatter() {
            return `
              <span style="color:${this.color}">\u25CF</span> Distance: <b>${bestEfforts[this.index].name}</b><br/>
              <span style="color:${this.color}">\u25CF</span> Time: <b>${getDuration(bestEfforts[this.index].elapsed_time).map(([num, str]) => `${num}${str}`).join(' ')}</b><br/>
              <span style="color:${this.color}">\u25CF</span> Rank: <b>${bestEfforts[this.index].pr_rank}</b><br/>
            `;
          }
        },
      },
      {
        ...seriesDefaultConfig,
        name: 'Efficiency Factor',
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
              addXAxisPlotLine(this.x, 'rgba(0, 0, 0, 0.5)', chartRef, setPlotLines)
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
      tickInterval: 240,
      minorGridLineWidth: 1,
      minorTicks: true,
      minorTickInterval: 60,
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
        labels: { style: { color: 'red' } },
        title: { text: 'Heart Rate', style: { color: 'red', fontSize: '1.25rem' } },
      },
      { // Secondary yAxis
        gridLineWidth: 1,
        height: '25%',
        top: '25%',
        min: velMin,
        max: velMax,
        id: 'vel',
        title: { text: 'Velocity', style: { color: 'black', fontSize: '1.25rem' } },
        labels: { format: '{value} mph', style: { color: 'black' } },
        opposite: true,
      },
      { // Secondary yAxis
        gridLineWidth: 0,
        height: '15%',
        top: '10%',
        id: 'laps',
        min: lapsData.length < 2 ? splitsMin * 0.97 : lapsMin,
        title: { text: lapsData.length < 2 ? 'Miles' : 'Laps', style: { color: 'black', fontSize: '1.25rem' } },
        labels: { format: '{value} mph', style: { color: 'black' } },
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
        title: { text: 'Elevation', style: { color: 'brown', fontSize: '1.25rem' } },
        labels: { format: '{value}', style: { color: 'brown' } },
        opposite: false,
      },
      { // Secondary yAxis
        gridLineWidth: 0,
        height: '25%',
        top: '75%',
        offset: 0,
        id: 'bestEfforts',
        title: { text: 'Best Efforts', style: { color: 'gold', fontSize: '1.25rem' } },
        labels: { format: '{value}', style: { color: 'gold' } },
        opposite: true,
      },
      { // Secondary yAxis
        gridLineWidth: 0,
        height: '15%',
        top: '35%',
        offset: 0,
        id: 'EfficiencyFactor',
        title: { text: 'Efficiency Factor', style: { color: 'blue', fontSize: '1.25rem' } },
        labels: { format: '{value}', style: { color: 'blue' } },
        opposite: false,
      },
    ]
  }), [magnificationFactor, title, heartRateData, velocityData, lapsData, splitsMiData, altitudeData, bestEffortsData, efficiencyFactorData, hrMin, hrMax, velMin, velMax, splitsMin, lapsMin, altMin, altMax, bestEfforts]);

  return (
    <div className="flex">
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
        <div style={{ height: chartHeight }}>
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
        <div className="flex valign-middle margin-t">
          <label htmlFor="magnificationFactor-range">Magnification: </label>
          <div className="flex-item-grow margin-l">
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
                <button key={val} onClick={() => setMagnificationFactor(initialMagnificationFactor * val)}>
                  {val}x
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          {plotLines.sort((a,b) => a - b).map((val) => (
            <div>
              <button
                key={val}
                onClick={() => {
                  const chart = chartRef.current?.chart;
                  if (!chart) return;
                  chart.xAxis[0].removePlotLine(val);
                  setPlotLines((lines) => lines.filter((v) => v !== val));
                }}
              >
                Remove Plotline at {val} seconds
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-item-grow">
        <RouteMap
          id={id}
          pointer={latlngPointer}
          segments={lapsData.length > 1 ? lapsData : splitsMiData}
          velocity={smoothVelocity}
          hrzones={hrzones}
        />
      </div>
    </div>
  );
};

export default HeartZonesChartDisplay;
