import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Surface from '../DLS/Surface';

const FlexibleChart = ({ title, data, width }) => {
  /** @type {Highcharts.Options} */
  const options = useMemo(() => ({
    chart: {
      type: 'line',
      height: 690,
      width,
      backgroundColor: 'transparent',
      zooming: { type: 'xy' }
    },
    title: {
      text: title,
    },
    series: [
      {
        data,
        yAxis: 0,
        color: 'black',
        lineWidth: 5,
      },
    ].filter(Boolean),
    legend: {
      enabled: false,
    },
    xAxis: {
      zoomEnabled: true,
      gridLineWidth: 0,
      alignTicks: false,
      tickInterval: 240,
      minorGridLineWidth: 0,
      minorTicks: true,
      enabled: false,
      labels: {
        enabled: false,
      },
      title: {
        enabled: false,
      },
    },
    yAxis: [
      { // Primary yAxis
        enabled: false,
        gridLineWidth: 0,
        labels: {
          enabled: false,
          style: {
            color: 'black'
          }
        },
        title: {
          enabled: false,
          text: 'HeartRate',
          style: {
            color: 'black'
          }
        },
      },
    ]
  }), [data, title, width]);

  return (
    <Surface style={{ height: 690 }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        allowChartUpdate={true}
      />
    </Surface>
  );
};

export default FlexibleChart;
