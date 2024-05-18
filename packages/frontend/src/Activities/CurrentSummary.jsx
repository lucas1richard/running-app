import React from 'react';
import dayjs, { utc } from 'dayjs';
import { getDateString, convertMetersToMiles } from '../utils';

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
    <div>
      <h3>{sumDistance(recentRuns).toFixed(2)} miles in the last week</h3>
      <h3>{sumDistance(sameYearRuns).toFixed(2)} miles this year</h3>
      <h3>{sumDistance(activities).toFixed(2)} miles all time</h3>

      {recentRuns.map(({ start_date, name, distance }) => (
        <div key={start_date}>{getDateString(start_date)} - {convertMetersToMiles(distance)}</div>
      ))}
    </div>
  );
};

export default CurrentSummary;
