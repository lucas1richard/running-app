import dayjs from 'dayjs';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMemo } from 'react';
import { prColors } from '../Common/colors';
import classNames from 'classnames';
import { getDuration } from '../utils';
import { rankMap } from '../Common/Icons/PRMedal';

const prColorsArr = [
  { value: 0, color: prColors.gold.fill, borderColor: prColors.gold.stroke },
  { value: 1, color: prColors.gold.fill, borderColor: prColors.gold.stroke },
  { value: 2, color: 'rgba(192, 192, 192, 0.9)', borderColor: prColors.silver.stroke },
  { value: 3, color: 'rgba(205, 127, 50, 0.9)', borderColor: prColors.bronze.stroke },
  { color: 'white', borderColor: 'black' },
]

const seriesDefaultConfig = {
  states: {
    inactive: {
      opacity: 1
    },
    hover: {
      lineWidthPlus: 0,
    },
  },
  fillOpacity: 0.3,
  lineWidth: 4,
  animation: false,
};

const yAxisDefaultConfig = {
  opposite: false,
}

const PRChart = ({ records: recordsProp, title }) => {
  const records = useMemo(
    () => recordsProp.filter(({ start_date_local }) => dayjs(start_date_local).isAfter(dayjs().subtract(1, 'year'))).reverse(),
    [recordsProp]
  );

  const options = useMemo(() =>
    /** @type {Highcharts.Options} */
    ({
    chart: {
      type: 'column',
      height: 300,
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
    series: [
      {
        name: 'Time',
        data: records.map(({ start_date_local, elapsed_time, pr_rank }) => ({
          x: new Date(start_date_local).getTime(),
          y: elapsed_time,
          borderColor: (prColorsArr[pr_rank] || prColorsArr[prColorsArr.length - 1]).borderColor,
          color: {
            linearGradient: { x1: 0, x2: 0, y1: 1, y2: 0 },
            stops: [
              [0, (prColorsArr[pr_rank] || prColorsArr[prColorsArr.length - 1]).color],
              [1, (prColorsArr[pr_rank] || prColorsArr[prColorsArr.length - 1]).borderColor]
            ],
          },
        })),
        yAxis: 0,
        pointWidth: 15,
        dataLabels: {
          enabled: true,
          formatter: function () {
            const className = classNames({
              'gold-text': this.point.pr_rank === 1,
              'silver-text': this.point.pr_rank === 2,
              'bronze-text': this.point.pr_rank === 3,
            });
            return `<div class="${className}">${dayjs(this.x).format('MMM DD')}</div>`;
          },
          style: {
            color: 'black',
          },
        },
        ...seriesDefaultConfig,
      },
    ],
    xAxis: {
      type: 'datetime',
      reversed: true,
      // gridLineWidth: 1,
      gridLineColor: 'rgba(0,0,0,0.4)',
      labels: {
        style: {
          color: 'black'
        }
      },
      min: dayjs().subtract(1, 'year').toDate().getTime(),
      max: new Date().getTime()
    },
    yAxis: [
      {
        ...yAxisDefaultConfig,
        title: {
          text: `${title} time`,
          style: {
            color: 'black'
          }
        },
        labels: {
          format: '{value} sec',
          style: {
            color: 'black',
          },
        },
      },
    ],
    tooltip: {
      useHTML: true,
      animation: false,
      formatter: function () {
        const index = this.point.index;
        const activity = records[index];
        const bgClassName = classNames({
          'gold-bg': activity.pr_rank === 1,
          'silver-bg': activity.pr_rank === 2,
          'bronze-bg': activity.pr_rank === 3,
        });
        const duration = getDuration(activity.elapsed_time).map(([num, str]) => `${num}${str}`).join(' ');
        return `
          <div class="text-center dls-white-bg pad border-1 ${bgClassName}">
            ${rankMap[activity.pr_rank]}<br />
            <b>${dayjs(activity.start_date_local).format('MMMM DD')}</b>
            <br />
            ${activity.name}
            <br />
            ${duration}
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
  }), [records, title]);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      allowChartUpdate={true}
    />
  );
};

export default PRChart;
