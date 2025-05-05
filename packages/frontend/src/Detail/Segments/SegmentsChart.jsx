import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import styles from '../Detail.module.css';
import Surface from '../../DLS/Surface';
import useDarkReaderMode from '../../hooks/useDarkReaderMode';

const getPlotbandConfig = ({ ix, text, to, from } = {}, borderColor, color) => {
    return {
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
      borderColor,
      color,
      useHTML: true,
      id: ix
    };
};

const SegmentsChart = ({ title, heartData, velocity, width, segments }) => {
  const isDarkMode = useDarkReaderMode();
  const contrastColor = isDarkMode ? '#fff' : '#000';
  /** @type {Highcharts.Options} */
  const options = {
    chart: {
      type: 'line',
      height: 400,
      width,
      backgroundColor: 'transparent',
    },
    title: {
      text: title,
    },
    series: [
      {
        name: 'HeartRate',
        data: heartData,
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
        color: contrastColor,
        animation: false,
      }
    ].filter(Boolean),
    xAxis: {
      plotBands: segments.map((band, ix) => getPlotbandConfig({
          ix,
          from: band.start_index,
          to: band.end_index,
          text: band.name
        }, contrastColor, 'rgba(0,0,0,0.05)'),
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
            color: contrastColor
          }
        },
        labels: {
          format: '{value} mph',
          style: {
            color: contrastColor
          }
        },
        opposite: true,
      }
    ]
  };

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
