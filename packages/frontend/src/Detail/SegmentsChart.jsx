import { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import styles from './Detail.module.css';
import Surface from '../DLS/Surface';

const getPlotbandConfig = ({ ix, text, to, from } = {}) => ({
  from,
  to,
  label: {
    align: 'left',
    style: {
      color: 'contrast',
      fontWeight: 'bold',
    },
    y: 16 * (ix % 18) + 16,
    useHTML: true,
    formatter() {
      return `<div class="${styles.bandLabel}">${text}</div>`
    },
  },
  borderWidth: 1,
  // borderColor: 'black',
  color: 'rgba(0,0,0,0.05)',
  useHTML: true,
  id: ix
});

const SegmentsChart = ({ title, data, velocity, zones, width, segments }) => {
  const options = useMemo(() => 
    /** @type {Highcharts.Options} */
  ({
    chart: {
      type: 'line',
      height: 400,
      width,
      backgroundColor: 'transparent',
    },
    title: {
      text: title,
    },
    zooming: 'x',
    series: [
      {
        name: 'HeartRate',
        data,
        yAxis: 0,
        color: 'red',
        lineWidth: 2,
        animation: false,

      },
      velocity && {
        name: 'Velocity',
        data: velocity.map(val => Math.round((val * 100 * 2.237)) / 100),
        yAxis: 1,
        lineWidth: 1,
        color: 'black',
        animation: false,
      }
    ].filter(Boolean),
    xAxis: {
      plotBands: segments.map((band, ix) => getPlotbandConfig({
          ix,
          from: band.start_index,
          to: band.end_index,
          text: band.name
        }),
      ),
      gridLineWidth: 0,
      alignTicks: false,
      tickInterval: 60,
      gridLineColor: '#aaa'
    },
    yAxis: [
      { // Primary yAxis
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
        title: {
          text: 'Velocity',
          style: {
            // color: 'black'
          }
        },
        labels: {
          format: '{value} mph',
          style: {
            // color: 'black'
          }
        },
        opposite: true,
      }
    ]
  }), [data, segments, title, velocity, width]);

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

export default SegmentsChart;
