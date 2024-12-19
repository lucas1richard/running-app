import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { selectActivities } from '../reducers/activities';
import useViewSize from '../hooks/useViewSize';

const CumulativeByRun = () => {
  const activities = useSelector(selectActivities);
  const isSmall = useViewSize().lte('sm');

  const data = useMemo(() => {
    let totalDistance = 0;
    const orderedActivities = [...activities].reverse().filter(
      ({ start_date_local }) => new Date(start_date_local).getFullYear() === new Date().getFullYear()
    );

    const data = [];
    
    for (let i = 0; i < orderedActivities.length; i++) {
      const activity = orderedActivities[i];
      totalDistance += Math.round(activity.distance_miles * 100) / 100;
      data.push([
        new Date(activity.start_date_local).getTime(),
        totalDistance,
      ]);
    }

    return data;
  }, [activities]);

  const options = useMemo(() => 
    /** @type {Highcharts.Options} */
    ({
    chart: {
      type: 'line',
      height: isSmall ? 800 : 600,
      animation: false,
    },
    title: {
      text: 'Volume by Run',
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Date',
      },
    },
    yAxis: {
      title: {
        text: 'Distance (miles)',
      },
    },
    series: [
      {
        name: 'Runs',
        type: 'area',
        data,
        tooltip: {
          pointFormat: 'Distance: <b>{point.y}</b> miles<br/>',
        },
        color: 'rgba(0,0,0,1)',
        fillColor: {
          linearGradient: [0, 0, 0, 500],
          stops: [
            [0, 'rgba(0,0,0,0.5)'],
            [1, 'rgba(0,0,0,0)'],
          ],
        },
        animation: false,
        marker: {
          enabled: true,
          radius: isSmall ? 3 : 5,
        },
      },
    ],
  }), [data, isSmall]);

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
};

export default CumulativeByRun;
