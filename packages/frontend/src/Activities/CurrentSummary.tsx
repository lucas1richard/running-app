import React from 'react';
import dayjs from 'dayjs';
import { convertMetersToMiles } from '../utils';

interface Activitiy {
  start_date: string;
  start_date_local: string;
  distance: number;
}

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

const CurrentSummary = ({
  activities,
}) => {
  const recentRuns = findRecent(activities, 7);
  const sameYearRuns = findSameYear(activities);
  return (
    <div className="dls-white-bg pad">
      <div className="heading-5">
        {sumDistance(recentRuns).toFixed(2)} miles in the last week
      </div>
      <div className="heading-5">
        {sumDistance(sameYearRuns).toFixed(2)} miles this year
      </div>
      <div className="heading-6">
        {sumDistance(activities).toFixed(2)} miles all time
      </div>
    </div>
  );
};

export default CurrentSummary;
