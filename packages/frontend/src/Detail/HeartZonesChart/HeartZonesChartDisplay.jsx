import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import variwide from 'highcharts/modules/variwide';
import { condenseZonesFromHeartRate, convertMetricSpeedToMPH } from '../../utils';
import { hrZonesBg, hrZonesText } from '../../colors/hrZones';
import getSmoothVal from './getSmoothVal';
import addXAxisPlotLine from './addXAxisPlotline';

variwide(Highcharts);

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
  title,
  data,
  velocity,
  time,
  zones,
  width,
  laps,
  zonesBandsDirection,
}) => {
  const [smoothAverageWindow, setSmoothAverageWindow] = useState(20);
  const [plotLines, setPlotLines] = useState([]);

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
    tooltip: {
      formatter() {
        return `
          <b>${this.x} seconds</b>
          <br>
          ${this.y.toFixed(2)}
        `;
      }
    },
    series: [
      {
        ...seriesDefaultConfig,
        name: 'HeartRate',
        data: heartRateData,
        yAxis: 0,
        color: 'red',
        fillOpacity: 0.1,
        point: {
          events: {
            click() {
              addXAxisPlotLine(this.x, 'rgba(255, 0, 0, 0.5)', chartRef, setPlotLines);
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
        point: {
          events: {
            click() {
              addXAxisPlotLine(this.x, 'rgba(0, 0, 0, 0.5)', chartRef, setPlotLines)
            }
          },
        },
      },
      {
        ...seriesDefaultConfig,
        name: 'Laps',
        type: 'variwide',
        data: lapsData,
        yAxis: 2,
        fillOpacity: 0.1,
        borderColor: 'rgba(0,0,0, 1)',
        borderWidth: 3,
        dataLabels: {
          enabled: false,
        },
        color: 'rgba(0,0,0, 0.1)',
      },
      {
        ...seriesDefaultConfig,
        name: 'Elevation',
        data: altitudeData,
        yAxis: 3,
        fillOpacity: 0.9,
        color: 'rgba(165, 42, 42, 0.5)',
        point: {
          events: {
            click() {
              addXAxisPlotLine(this.x, 'rgba(165, 42, 42, 0.5)', chartRef, setPlotLines)
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
        height: '33.33%',
        top: '0%',
        labels: { style: { color: 'red' } },
        title: { text: 'Heart Rate', style: { color: 'red', fontSize: '1.25rem' } },
      },
      { // Secondary yAxis
        gridLineWidth: 1,
        height: '33.33%',
        top: '33.33%',
        title: { text: 'Velocity', style: { color: 'black', fontSize: '1.25rem' } },
        labels: { format: '{value} mph', style: { color: 'black' } },
        opposite: true,
      },
      { // Secondary yAxis
        gridLineWidth: 1,
        height: '20%',
        top: '13.33%',
        // offset: '13.33%',
        title: { text: 'Laps', style: { color: 'black', fontSize: '1.25rem' } },
        labels: { format: '{value} mph', style: { color: 'black' } },
        opposite: true,
      },
      { // Secondary yAxis
        gridLineWidth: 1,
        height: '33.33%',
        top: '66.66%',
        offset: 0,
        title: { text: 'Elevation', style: { color: 'brown', fontSize: '1.25rem' } },
        labels: { format: '{value}', style: { color: 'brown' } },
        opposite: false,
      },
    ]
  }), [altitudeData, heartRateData, magnificationFactor, title, velocityData, lapsData]);

  return (
    <div>
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
  );
};

export default HeartZonesChartDisplay;
