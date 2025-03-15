import { useMemo } from 'react';
import { Flex } from '../DLS';
import useViewSize from '../hooks/useViewSize';
import CumulativeByRun from './CumulativeByRun';
import VolumeTable from './VolumeTable';
import { useAppSelector } from '../hooks/redux';
import { selectActivities } from '../reducers/activities';

const Volume = () => {
  const viewSize = useViewSize();
  const isSmall = viewSize.lte('sm');
  const activities = useAppSelector(selectActivities);

  const { groupedData, greatestTotal } = useMemo(() => {
    const groupedData = {};
    let totalDistance = 0;
    
    const orderedActivities = [...activities].reverse();
    let greatestTotal = 0;

    for (let i = 0; i < orderedActivities.length; i++) {
      const activity = orderedActivities[i];
      const start_date_local = activity.start_date_local;
      const year = new Date(start_date_local).getFullYear();
      if (!groupedData[year]) {
        groupedData[year] = [];
        totalDistance = 0;
      }
      totalDistance += Math.round(activity.distance_miles * 100) / 100;
      groupedData[year].push([
        new Date(new Date(activity.start_date_local).setFullYear(2020)).getTime(),
        Math.round(totalDistance * 100) / 100,
      ]);

      greatestTotal = Math.max(greatestTotal, totalDistance);
    }

    return { groupedData, greatestTotal };
  }, [activities]);
  return (
    <div>
      <CumulativeByRun
        groupedData={groupedData}
        greatestTotal={greatestTotal}
      />
      <Flex $directionSmDown="column" $marginTop={1} $gap={1} $justify="center">
        <VolumeTable timeGroup="week" />
        {viewSize.gte('md') && (
          <VolumeTable timeGroup="month" />
        )}
      </Flex>
    </div>
  );
};

export default Volume;
