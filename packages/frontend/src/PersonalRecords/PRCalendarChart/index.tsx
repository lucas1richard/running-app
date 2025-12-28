import { useMemo } from 'react';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import Surface from '../../DLS/Surface';
import CalendarUI from './CalendarUI';
import { useAppSelector } from '../../hooks/redux';
import { getPRs } from '../../reducers/prs';
import { Basic } from '../../DLS';
import PRMedal from '../../Common/Icons/PRMedal';
import { Link } from 'react-router-dom';
import DurationDisplay from '../../Common/DurationDisplay';

dayjs.extend(weekday);
dayjs.extend(weekOfYear);

const PRCalendarChart = ({ records: recordsProp }) => {
  const allTimePrs = useAppSelector(getPRs);
  const sets = useMemo(() => {
    const names = Object.keys(recordsProp);
    return names.map((name) => ({
      name,
      allTimeBest: allTimePrs.find(pr => pr.name === name),
      data: recordsProp[name].filter(({ start_date_local }) => dayjs(start_date_local)).reverse()
    }))
  }, [recordsProp]);
  const currentMonth = dayjs().subtract(0, 'month');
  return (
    <div>
      {sets.map(set => (
        <div key={set.name} className="card mb-4">
          <h3>{set.name}</h3>
          <div className="flex overflow-x-scroll hide-scrollbar gap-2">
            <Surface key={set.allTimeBest.distance} style={{ width: '280px'}} className="flex flex-col flex-item-grow justify-center p-4 card text-center raised-2">
              <Basic.Div $fontSize="h1">
                <PRMedal type="native" color="gold" />
              </Basic.Div>
              <Basic.Div $fontSize="h4">
                <Link className="heading-4" to={`/${set.allTimeBest.activityId}/detail`}>{set.allTimeBest.name}</Link>
              </Basic.Div>
              <div>
                {dayjs(set.allTimeBest.start_date_local).format('MMMM DD, YYYY')}
              </div>
              <Basic.Div $fontSize="h4">
                <DurationDisplay numSeconds={set.allTimeBest.elapsed_time} />
              </Basic.Div>
            </Surface>
            {Array.from({ length: 24 }).map((_, idx) => (
              <Surface key={idx} className="p-4 card raised-2 flex-item-grow" variant="foreground">
                <h4 className="text-center mb-4">{currentMonth.subtract(idx, 'month').format('MMM YYYY')}</h4>
                <CalendarUI records={set.data} monthStartDate={currentMonth.subtract(idx, 'month')} />
              </Surface>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PRCalendarChart;
