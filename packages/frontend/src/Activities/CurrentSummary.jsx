import React from 'react';
import dayjs, { utc } from 'dayjs';
import { convertMetersToMiles } from '../utils';

dayjs.extend(utc);

const findRecent = (allActivities, numDays) => {
  const currentDateUTC = dayjs.utc();
  return allActivities.filter(({ start_date }) => {
    const activityDateUTC = dayjs(start_date);
    return Math.floor((currentDateUTC - activityDateUTC) / (24 * 60 * 60 * 1000)) < numDays;
  });
};

const findSameYear = (allActivities) => {
  const currentDate = dayjs();
  return allActivities.filter(({ start_date_local }) => dayjs(start_date_local).isSame(currentDate, 'year'));
};

const sumDistance = (activities) => {
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
