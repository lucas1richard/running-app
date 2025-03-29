import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { convertMetersToMiles } from '../utils';
import { Basic, Grid } from '../DLS';

const NUMBER_OF_DAYS = 7;

const findRecent = (allActivities: Activity[], numDays: number) => {
  const currentDateUTC = dayjs.utc();
  return allActivities.filter(({ start_date }) => {
    const activityDateUTC = currentDateUTC.diff(dayjs(start_date).utc());
    return Math.floor(activityDateUTC / (24 * 60 * 60 * 1000)) < numDays;
  });
};

const findSameYear = (allActivities: Activity[]) => {
  const currentDate = dayjs();
  return allActivities.filter(({ start_date_local }) => dayjs(start_date_local).isSame(currentDate, 'year'));
};

const sumDistance = (activities: Activity[]) => {
  const meters = activities.reduce((acc, { distance }) => acc + distance, 0);
  return convertMetersToMiles(meters);
};

const CurrentSummary: React.FC<{ activities: Activity[] }> = ({
  activities,
}) => {
  const recentRuns = useMemo(() => findRecent(activities, NUMBER_OF_DAYS), [activities]);
  const sameYearRuns = useMemo(() => findSameYear(activities), [activities]);

  return (
    <Grid
      $templateColumnsLgDown="repeat(auto-fill, minmax(250px, 1fr))"
      $colorBg="white"
      $pad={1}
      $gapSmDown={2}
    >
      <Basic.Div $flexGrow="1" $textAlign="center">
        <Basic.Div $fontSize="h5">Miles in the last {NUMBER_OF_DAYS} days</Basic.Div>
        <Basic.Div $fontSize="h2">{sumDistance(recentRuns).toFixed(2)}</Basic.Div>
      </Basic.Div>

      <Basic.Div $flexGrow="1" $textAlign="center">
        <Basic.Div $fontSize="h5">Miles this year</Basic.Div>
        <Basic.Div $fontSize="h2">{sumDistance(sameYearRuns).toFixed(2)}</Basic.Div>
      </Basic.Div>

      <Basic.Div $flexGrow="1" $textAlign="center">
        <Basic.Div $fontSize="h5">All time</Basic.Div>
        <Basic.Div $fontSize="h2">{sumDistance(activities).toFixed(2)}</Basic.Div>
      </Basic.Div>
    </Grid>
  );
};

export default CurrentSummary;
