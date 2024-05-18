import React from 'react';
import HeartZonesChartDisplay from './HeartZonesChartDisplay';
import { useSelector } from 'react-redux';
import { makeSelectActivity, makeSelectStreamType } from '../../reducers/activities';
import { makeSelectZones } from '../../reducers/heartszones';

const HeartZonesChartContainer = ({ id }) => {
  const activity = useSelector(makeSelectActivity(id)) || {};
  const heartRateStream = useSelector(makeSelectStreamType(id, 'heartrate'));
  const velocityStream = useSelector(makeSelectStreamType(id, 'velocity_smooth'));
  const zones = useSelector(makeSelectZones(activity.start_date));

  return (
    <HeartZonesChartDisplay
      data={heartRateStream.data}
      velocity={velocityStream?.data}
      zones={zones}
    />
  );
};

export default HeartZonesChartContainer;
