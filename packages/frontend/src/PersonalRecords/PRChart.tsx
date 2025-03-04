import dayjs from 'dayjs';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMemo } from 'react';
import { prColors } from '../Common/colors';
import classNames from 'classnames';
import { getDurationString } from '../utils';
import { rankMap } from '../Common/Icons/PRMedal';
import useViewSize from '../hooks/useViewSize';

const prColorsArr = [
  { value: 0, color: prColors.gold.fill, borderColor: prColors.gold.stroke },
  { value: 1, color: prColors.gold.fill, borderColor: prColors.gold.stroke },
  { value: 2, color: 'rgba(192, 192, 192, 0.9)', borderColor: prColors.silver.stroke },
  { value: 3, color: 'rgba(205, 127, 50, 0.9)', borderColor: prColors.bronze.stroke },
  { value: 4, color: 'rgba(0,0,0,0)', borderColor: 'rgba(0, 0, 250, 0.7)' },
  { value: 5, color: 'rgba(0,0,0,0)', borderColor: 'rgba(0, 0, 250, 0.6)' },
  { value: 6, color: 'rgba(0,0,0,0)', borderColor: 'rgba(0, 0, 250, 0.5)' },
  { value: 7, color: 'rgba(0,0,0,0)', borderColor: 'rgba(0, 0, 250, 0.4)' },
  { value: 8, color: 'rgba(0,0,0,0)', borderColor: 'rgba(0, 0, 250, 0.3)' },
  { value: 9, color: 'rgba(0,0,0,0)', borderColor: 'rgba(0, 0, 250, 0.2)' },
  { value: 10, color: 'rgba(0,0,0,0)', borderColor: 'rgba(0, 0, 250, 0.1)' },
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
  const isSmall = useViewSize().lte('sm');
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
        pointWidth: isSmall ? 8 : 15,
        dataLabels: {
          enabled: true,
          useHTML: true,
          formatter: function () {
            const className = classNames({
              'gold-text': this.point.pr_rank === 1,
              'silver-text': this.point.pr_rank === 2,
              'bronze-text': this.point.pr_rank === 3,
            });
            const duration = getDurationString(this.y, ['',':',':'], '');
            return `
              <div class="text-center">
              <div class="${className}">${dayjs(this.x).format('MMM DD')}</div>
              <div><b>${duration}</b></div>
              </div>
            `;
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
        const duration = getDurationString(activity.elapsed_time);
        return `
          <div class="text-center dls-white-bg pad border-1 ${bgClassName}">
            ${rankMap[activity.pr_rank]}<br />
            <b>${dayjs(activity.start_date_local).format('MM/DD')}</b>
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
  }), [isSmall, records, title]);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      allowChartUpdate={true}
    />
  );
};

export default PRChart;
