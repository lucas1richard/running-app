import React from 'react';
import HeartZonesChartDisplay from './HeartZonesChartDisplay';
import { useSelector } from 'react-redux';
import { selectActivity, selectStreamType } from '../../reducers/activities';
import { selectHeartZones } from '../../reducers/heartszones';

const HeartZonesChartContainer = ({ id }) => {
  const activity = useSelector((state) => selectActivity(state, id)) || {};
  const heartRateStream = useSelector((state) => selectStreamType(state, id, 'heartrate'));
  const velocityStream = useSelector((state) => selectStreamType(state, id, 'velocity_smooth'));
  const zones = useSelector((state) => selectHeartZones(state, activity.start_date));

  return (
    <HeartZonesChartDisplay
      data={heartRateStream.data}
      velocity={velocityStream?.data}
      zones={zones}
    />
  );
};

export default HeartZonesChartContainer;
