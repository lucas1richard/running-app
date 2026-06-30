import HeatMapContainer from '@/Activities/HeatMapContainer';
import { Basic } from '@/DLS';
import { useAppSelector } from '@/hooks/redux';
import useShowAfterMount from '@/hooks/useShowAfterMount';
import useViewSize from '@/hooks/useViewSize';
import { selectListActivities } from '@/reducers/activities';
import D3BarChart from '@/DLS/D3BarChart';
import CumulativeByRun from '@/Volume/CumulativeByRun';
import VolumeTable from '@/Volume/VolumeTable';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import D3LineChart from '@/DLS/D3LineChart';

const Volume = () => {
  const showChart = useShowAfterMount();
  const viewSize = useViewSize();
  const isSmall = viewSize.lte('sm');
  const activities = useAppSelector(selectListActivities);

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
  }, [activities, activities.length]);
  return (
    <Basic.Div $margin={2}>
      {/* {showChart && <CumulativeByRun
        groupedData={groupedData}
        greatestTotal={greatestTotal}
      />} */}
      {showChart && (
        <D3LineChart
          series={Object.keys(groupedData).map((year, i) => {
            return (
              {
                id: 'Runs in ' + year,
                type: 'line',
                data: groupedData[year].map((d) => ({
                  label: dayjs(d[0]).format('MM-DD'),
                  value: d[1],
                })),
                pointShape: 'cross',
                color: ['magenta', 'yellow', 'cyan', 'orange', 'black'][i % 5],
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
          })}
          type={'datetime'}
          width={3000}
          height={600}
        />
      )}
      <Basic.Div $display="flex">
        <Basic.Div
          $marginT={1}
          $display="flex"
          $directionSmDown="column"
          $flexJustify="center"
          $gap={1}
        >
          <VolumeTable timeGroup="week" />
          {viewSize.gte('md') && (
            <>
              <VolumeTable timeGroup="month" />
              <VolumeTable timeGroup="year" />
            </>
          )}
        </Basic.Div>
        <Basic.Div
          $marginL={2}
          $flexGrow="1"
          // $templateColumns="1fr"
          // $templateColumnsMdUp="repeat(2, 1fr)"
          // $templateColumnsXl="repeat(4, 1fr) !important"
          $marginT={2}
        // $gap={1}
        >
          <div>
            <Basic.Div $fontSize="h2" $marginB={1}>Past 7 Days</Basic.Div>
            <HeatMapContainer timeframe="1 week" />
          </div>
          <div>
            <Basic.Div $fontSize="h2" $marginT={3} $marginB={1}>Past Month</Basic.Div>
            <HeatMapContainer timeframe="1 month" />
          </div>
          <div>
            <Basic.Div $fontSize="h2" $marginT={3} $marginB={1}>Past 6 Months</Basic.Div>
            <HeatMapContainer timeframe="6 month" />
          </div>
          <div>
            <Basic.Div $fontSize="h2" $marginT={3} $marginB={1}>Past 1 Year</Basic.Div>
            <HeatMapContainer timeframe="1 year" />
          </div>
        </Basic.Div>
      </Basic.Div>
    </Basic.Div>

  );
};

export default Volume;
