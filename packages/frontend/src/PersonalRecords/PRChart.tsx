import dayjs from 'dayjs';
import Highcharts, { offset } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { memo, useMemo } from 'react';
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
  { value: 4, color: 'rgba(200, 200, 200, 0.7)', borderColor: 'rgba(0, 0, 250, 0.7)' },
  { value: 5, color: 'rgba(200,200,200,0.6)', borderColor: 'rgba(0, 0, 250, 0.6)' },
  { value: 6, color: 'rgba(200,200,200,0.5)', borderColor: 'rgba(0, 0, 250, 0.5)' },
  { value: 7, color: 'rgba(200,200,200,0.4)', borderColor: 'rgba(0, 0, 250, 0.4)' },
  { value: 8, color: 'rgba(200,200,200,0.3)', borderColor: 'rgba(0, 0, 250, 0.3)' },
  { value: 9, color: 'rgba(200,200,200,0.2)', borderColor: 'rgba(0, 0, 250, 0.2)' },
  { value: 10, color: 'rgba(200,200,200,0.1)', borderColor: 'rgba(0, 0, 250, 0.1)' },
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
  const sets = useMemo(() => {
    const names = Object.keys(recordsProp);
    return names.map((name) => ({
      name,
      data: recordsProp[name].filter(({ start_date_local }) => dayjs(start_date_local).isAfter(dayjs().subtract(1, 'year'))).reverse()
    }))
  }, []);

  const options = useMemo(() =>
  /** @type {Highcharts.Options} */
  ({
    chart: {
      type: 'column',
      height: 2200,
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
    series: sets.map(({ name, data }, ix) => ({
      name,
      data: data.map(({ start_date_local, elapsed_time, pr_rank }) => ({
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
      yAxis: ix,
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
          const duration = getDurationString(this.y, ['', ':', ':'], '');
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
    })),
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
    yAxis: sets.map(({ name }, ix) => ({
      ...yAxisDefaultConfig,
      title: {
        text: `${name} time`,
        style: {
          color: 'red',
          fontSize: '18px',
          fontWeight: 'bold',
        },
      },
      labels: {
        format: '{value} sec',
        style: {
          color: 'black',
        },
      },
      height: `${60 / (sets.length || 1)}%`,
      top: `${ix * 100 / (sets.length || 1)}%`,
      opposite: !!(ix % 2),
      offset: 0,
    })),
    tooltip: {
      enabled: false,
      useHTML: true,
      animation: false,
      borderWidth: 0,
      backgroundColor: 'none',
      pointFormat: '{point.y}',
      headerFormat: '',
      shadow: false,
      style: {
        fontSize: '18px'
      },
    },
  }), [isSmall, sets, title]);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      allowChartUpdate={true}
    />
  );
};

export default memo(PRChart);
