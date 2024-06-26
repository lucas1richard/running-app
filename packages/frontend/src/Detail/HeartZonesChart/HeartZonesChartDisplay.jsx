import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { condenseZonesFromHeartRate, convertMetricSpeedToMPH } from '../../utils';
import { hrZonesBg, hrZonesText } from '../../colors/hrZones';

const seriesDefaultConfig = {
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

const HeartZonesChartDisplay = ({
  id,
  altitude,
  title,
  data,
  velocity,
  time,
  zones,
  width,
  zonesBandsDirection,
  minScrollWidth = 10,
}) => {
  const [plotLines, setPlotLines] = useState([]);
  const chartHeight = 600;
  const fullTime = useMemo(() => {
    const maxTime = time[time.length - 1];
    const timeArr = new Array(maxTime).fill(0).map((_, ix) => ix);
    for (let i = 0, j = 0; i < timeArr.length; i++) {
      if (time[j] === i) j++;
      else timeArr[i] = null;
    }
    return timeArr;
  }, [time]);

  const hrzones = useMemo(() => condenseZonesFromHeartRate(zones, data, fullTime), [zones, data, fullTime]);

  /** @type {React.MutableRefObject<{ chart: Highcharts.Chart }>} */
  const chartRef = useRef();

  const xAxisBands = useMemo(() => hrzones.map((band, ix) => ({
    color: hrZonesBg[band.zone],
    id: `hrZoneBand-${ix}`,
    ...band
  })), [hrzones]);

  const yAxisBands = useMemo(() => [1,2,3,4,5].map((z, ix) => ({
    from: zones[`z${z}`],
    to: (zones[`z${z + 1}`] - 1) || 220,
    color: hrZonesBg[z],
    id: 'hrZoneBand',
  })), [zones]);

  const heartRateData = useMemo(() => fullTime.map((val, ix) => [val, data[val]]), [data, fullTime]);
  const altitudeData = useMemo(() => fullTime.map((val, ix) => [val, altitude[val]]), [altitude, fullTime]);
  const velocityData = useMemo(() => fullTime.map((val, ix) => [val, convertMetricSpeedToMPH(velocity[val])]), [velocity, fullTime]);

  const addXAxisPlotLine = useCallback((xVal, color) => {
    const chart = chartRef.current?.chart;
    if (!chart) return;

    const existingPlotline = chart.xAxis[0].plotLinesAndBands.find(({ id }) => id === xVal);
    if (existingPlotline) {
      chart.xAxis[0].removePlotLine(xVal);
      setPlotLines((lines) => lines.filter((val) => val !== xVal));
    } else {
      chart.xAxis[0].addPlotLine({
        value: xVal,
        color,
        width: 5,
        id: xVal,
        label: {
          text: xVal
        }
      });
      setPlotLines((lines) => [...lines, xVal]);
    }
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
  }, [xAxisBands, yAxisBands, zonesBandsDirection]);

  const options = useMemo(() => 
    /** @type {Highcharts.Options} */
    ({
    chart: {
      type: 'spline',
      height: chartHeight,
      alignThresholds: true,
      alignTicks: true,
      zooming: {
        type: 'x',
      },
      scrollablePlotArea: {
        minWidth: minScrollWidth,
        scrollPositionX: 1
      },
    },
    legend: {
      enabled: false,
    },
    title: {
      text: title,
    },
    plotOptions: {
      connectEnds: false,
      connectNulls: false,
    },
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
        point: {
          events: {
            click() {
              addXAxisPlotLine(this.x, 'rgba(255, 0, 0, 0.5)')
            }
          },
        },
      },
      {
        ...seriesDefaultConfig,
        name: 'Elevation',
        data: altitudeData,
        yAxis: 1,
        fillOpacity: 0.9,
        type: 'area',
        color: 'rgba(165, 42, 42, 0.5)',
        point: {
          events: {
            click() {
              addXAxisPlotLine(this.x, 'rgba(165, 42, 42, 0.5)')
            }
          },
        },
      },
      {
        ...seriesDefaultConfig,
        name: 'Velocity',
        data: velocityData,
        yAxis: 2,
        color: 'black',
        point: {
          events: {
            click() {
              addXAxisPlotLine(this.x, 'rgba(0, 0, 0, 0.5)')
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
        labels: {
          style: {
            color: 'red',
          }
        },
        title: {
          text: 'Heart Rate',
          style: {
            color: 'red',
            fontSize: '1.25rem'
          }
        },
      },
      { // Secondary yAxis
        gridLineWidth: 1,
        height: '33.33%',
        top: '66.66%',
        offset: 0,
        title: {
          text: 'Elevation',
          style: {
            color: 'brown',
            fontSize: '1.25rem'
          }
        },
        labels: {
          format: '{value}',
          style: {
            color: 'brown'
          }
        },
        opposite: false,
      },
      { // Secondary yAxis
        gridLineWidth: 1,
        height: '33.33%',
        top: '33.33%',
        title: {
          text: 'Velocity',
          style: {
            color: 'black',
            fontSize: '1.25rem'
          }
        },
        labels: {
          format: '{value} mph',
          style: {
            color: 'black',
          }
        },
        opposite: true,
      },
    ]
  }), [addXAxisPlotLine, altitudeData, heartRateData, minScrollWidth, title, velocityData]);

  return (
    <div>
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
