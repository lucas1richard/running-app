import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { selectActivities } from '../reducers/activities';
import useViewSize from '../hooks/useViewSize';
import dayjs from 'dayjs';
import Surface from '../DLS/Surface';
import useDarkReaderMode from '../hooks/useDarkReaderMode';

const currentYear = new Date().getFullYear();

const CumulativeByRun = ({data, greatestTotal, groupedData }) => {
  const viewSize = useViewSize();
  const isSmall = viewSize.lte('sm');
  const isDarkMode = useDarkReaderMode();
  const contrastColor = isDarkMode ? '#fff' : '#000';
  const options = useMemo(() => 
    /** @type {Highcharts.Options} */
    ({
    chart: {
      type: 'line',
      height: isSmall ? 800 : 600,
      animation: false,
      backgroundColor: 'transparent',
      zooming: {
        type: 'x',
      }
    },
    title: {
      text: 'Volume by Run',
      style: {
        color: contrastColor,
      },
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Date',
        style: {
          color: contrastColor,
        },
      },
      labels: {
        style: {
          color: contrastColor,
        },
      },
    },
    legend: {
      enabled: true,
      itemStyle: {
        color: contrastColor,
      },
    },    
    yAxis: {
      title: {
        text: 'Distance (miles)',
        style: {
          color: contrastColor,
        },
      },
      labels: {
        style: {
          color: contrastColor,
        },
      },
      max: greatestTotal,
    },
    series: Object.keys(groupedData).map((year) => {
      return (
      {
        name: 'Runs in ' + year,
        type: 'line',
        data: groupedData[year],
        tooltip: {
          pointFormat: 'Distance: <b>{point.y}</b> miles<br/>',
        },
        animation: false,
        marker: {
          enabled: true,
          radius: isSmall ? 3 : 5,
        },
      }
    )
    }),
  }), [data, isSmall, isDarkMode]);

  return (
    <Surface>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </Surface>
  );
};

export default CumulativeByRun;
