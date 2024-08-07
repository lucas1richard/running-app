import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { convertMetersToMiles } from '../utils';

const findRecent = (allActivities: Activitiy[], numDays: number) => {
  const currentDateUTC = dayjs.utc();
  return allActivities.filter(({ start_date }) => {
    const activityDateUTC = dayjs(start_date).utc().diff(currentDateUTC);
    return Math.floor(activityDateUTC / (24 * 60 * 60 * 1000)) < numDays;
  });
};

const findSameYear = (allActivities: Activitiy[]) => {
  const currentDate = dayjs();
  return allActivities.filter(({ start_date_local }) => dayjs(start_date_local).isSame(currentDate, 'year'));
};

const sumDistance = (activities: Activitiy[]) => {
  const meters = activities.reduce((acc, { distance }) => acc + distance, 0);
  return convertMetersToMiles(meters);
};

const CurrentSummary: React.FC<{ activities: Activitiy[] }> = ({
  activities,
}) => {
  const recentRuns = useMemo(() => findRecent(activities, 7), []);
  const sameYearRuns = useMemo(() => findSameYear(activities), []);

  return (
    <div className="dls-white-bg pad flex flex-even">
      <div className="flex-item-grow text-center">
        <h2 className="heading-5">Miles in the last week</h2>
        <div className="heading-5">{sumDistance(recentRuns).toFixed(2)}</div>
      </div>

      <div className="flex-item-grow text-center">
        <h2 className="heading-5">Miles this year</h2>
        <div className="heading-5">{sumDistance(sameYearRuns).toFixed(2)}</div>
      </div>

      <div className="flex-item-grow text-center">
        <h2 className="heading-5">All time</h2>
        <div className="heading-5">{sumDistance(activities).toFixed(2)}</div>
      </div>
    </div>
  );
};

export default CurrentSummary;
