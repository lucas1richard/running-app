import { useMemo } from 'react';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { Grid } from '../../DLS';
import { useNavigate } from 'react-router-dom';

dayjs.extend(weekday);
dayjs.extend(weekOfYear);

const prsMap = {
  1: 'bg-gold-200 hover:bg-gold-300 text-neutral-900 raised-1',
  2: 'bg-silver-500 hover:bg-silver-600 text-neutral-100 raised-1',
  3: 'bg-bronze-500 hover:bg-bronze-600 text-neutral-900 raised-1',
  4: 'bg-emerald-300 hover:bg-emerald-400 text-neutral-900 raised-1',
  5: 'bg-emerald-400 hover:bg-emerald-500 text-neutral-900 raised-1',
  6: 'bg-emerald-500 hover:bg-emerald-600 text-neutral-900 raised-1',
  7: 'bg-emerald-600 hover:bg-emerald-700 text-neutral-100 raised-1',
  8: 'bg-emerald-700 hover:bg-emerald-800 text-neutral-100 raised-1',
  9: 'bg-emerald-800 hover:bg-emerald-900 text-neutral-100 raised-1',
  10: 'bg-emerald-900 hover:bg-emerald-800 text-neutral-100 raised-1',
};

const CalendarUI = ({ records: recordsProp, monthStartDate }: { records: BestEffort[]; monthStartDate: dayjs.Dayjs }) => {
  const navigate = useNavigate();
  const currentMonth = dayjs(monthStartDate);
  const dateActivities = recordsProp.reduce((acc, pr) => {
    const dateKey = dayjs(pr.start_date_local).format('YYYY-MM-DD');
    acc[dateKey] = acc[dateKey] || [];
    acc[dateKey].push(pr);
    return acc;
  }, {}) as Record<string, BestEffort[]>;

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.startOf('month').weekday();
  
  const daysUI = useMemo(() => {
    const days = [];
    const daysArray = [...Array(daysInMonth)].map((_, i) => i + 1);
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`}></div>);
    }
    
    daysArray.forEach((day) => {
      const currentDate = currentMonth.date(day);
      const formattedDate = currentDate.format('YYYY-MM-DD');

      const hasActivities = dateActivities[formattedDate]?.length > 0;
      const bestPR = dateActivities[formattedDate]?.reduce((best, pr) => Math.min(best, pr.pr_rank), Infinity);
      const colorBg = hasActivities
        ? (prsMap[bestPR])
        : 'bg-foreground sunken-1';
      
      const onClick = () => {
        if (hasActivities) {  
          navigate(`/${dateActivities[formattedDate][0].activityId}/detail`);
        }
      };
        
      days.push(
        <div role={hasActivities ? 'button' : undefined} onClick={onClick} className={`bg-foreground sunken-1`} key={`day-${day}`}>
          <div className={`${colorBg} text-sm w-full h-full flex items-center justify-center flex-item-grow`}>
            <span>{bestPR !== Infinity ? bestPR : ''}</span>
          </div>
        </div>
      );
    });
    
    return days;
  }, [daysInMonth, firstDayOfMonth, currentMonth, dateActivities]);

  return (
    <Grid
      $templateColumns={`repeat(7, 2rem)`}
      $templateRows={`repeat(6, 2rem)`}
      $gap={0.25}
    >
      {daysUI}
    </Grid>
  );
};

export default CalendarUI;
