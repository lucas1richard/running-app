import React, { useEffect, useMemo, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { condenseZonesFromHeartRate } from '../../utils';
import { hrZonesBg, hrZonesText } from '../../colors/hrZones';

const HeartZonesChartDisplay = ({
  id,
  altitude,
  title,
  data,
  velocity,
  zones,
  width,
  zonesBandsDirection,
}) => {
  const hrzones = useMemo(() => condenseZonesFromHeartRate(zones, data), [zones, data]);

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

  /** @type {Highcharts.Options} */
  const options = useMemo(() => ({
    chart: {
      type: 'line',
      height: 400,
      alignThresholds: true,
      alignTicks: true,
    },
    title: {
      text: title,
    },
    zooming: {
      type: 'x',
    },
    series: [
      {
        name: 'HeartRate',
        data,
        yAxis: 0,
        color: 'red',
        lineWidth: 2,
        animation: false,
      },
      altitude && {
        name: 'altitude',
        data: altitude,
        yAxis: 1,
        lineWidth: 1,
        color: 'rgba(165, 42, 42, 0.5)',
        animation: false,
        type: 'area',
      },
      velocity && {
        name: 'Velocity',
        data: velocity.map(val => Math.round((val * 100 * 2.237)) / 100),
        yAxis: 2,
        lineWidth: 1,
        color: 'black',
        animation: false,
      },
      
    ].filter(Boolean),
    xAxis: {
      zoomEnabled: true,
      gridLineWidth: 2,
      alignTicks: false,
      tickInterval: 240,
      minorGridLineWidth: 1,
      minorTicks: true,
      minorTickInterval: 60,
      minorTickLength: 4,
      minorGridLineColor: 'rgba(0,0,0,0.3)',
      gridLineColor: 'rgba(0,0,0,0.4)'
    },
    yAxis: [
      { // Primary yAxis
        height: '75%',
        labels: {
          style: {
            color: 'red'
          }
        },
        title: {
          text: 'HeartRate',
          style: {
            color: 'red'
          }
        },
      },
      { // Secondary yAxis
        gridLineWidth: 0,
        height: '25%',
        top: '75%',
        title: {
          text: 'Altitude',
          style: {
            color: 'brown'
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
        gridLineWidth: 0,
        height: '75%',
        title: {
          text: 'Velocity',
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
        opposite: true,
      },
      
    ]
  }), [altitude, data, title, velocity]);

  return (
    <div style={{ height: 410 }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        allowChartUpdate={true}
        ref={chartRef}
      />
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
    </div>
  );
};

export default HeartZonesChartDisplay;
