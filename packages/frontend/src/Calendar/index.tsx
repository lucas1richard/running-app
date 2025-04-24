import { useCallback, useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { Basic, Button, Grid } from '../DLS';
import { useAppSelector } from '../hooks/redux';
import { selectActivitiesByDate } from '../reducers/activities';
import Tile from '../Activities/Tile';
import useViewSize from '../hooks/useViewSize';

dayjs.extend(weekday);
dayjs.extend(weekOfYear);

const CalendarView = () => {
  const viewSize = useViewSize();
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const dateActivities = useAppSelector(selectActivitiesByDate);
  
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.startOf('month').weekday();
  
  const navigateMonth = useCallback((direction: number) => {
    setCurrentMonth(currentMonth.add(direction, 'month'));
  }, [currentMonth]);
  
  const isMobile = viewSize.lte('md');

  const { daysUI, daysWithActivities } = useMemo(() => {
    const days = [];
    let daysWithActivities = 0;
    const daysArray = [...Array(daysInMonth)].map((_, i) => i + 1);
    
    if (!isMobile) {
      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<Basic.Div $colorBg="transparent" key={`empty-${i}`} $pad={1}></Basic.Div>);
      }
    }
    
    daysArray.forEach(day => {
      const currentDate = currentMonth.date(day);
      const currentDayOfWeek = currentDate.day();
      const isWeekend = currentDayOfWeek === 0;
      const formattedDate = currentDate.format('YYYY-MM-DD');

      const hasActivities = dateActivities[formattedDate]?.length > 0;
      if (hasActivities) daysWithActivities++;

      if (isMobile && isWeekend) {
        days.push(
          <Basic.Div
            $display="flex"
            $flexJustify="space-between"
            key={`weekendMarker-${day}`}
            $color="blue0"
            $pad={0.5}
            $fontSize="h3"
            $borderB="1px solid"
            $marginT={5}
          >
            Sunday
            <Basic.Div $color="blue0" $textAlign="center">
              {day}
            </Basic.Div>
          </Basic.Div>
        );
      }
      
      days.push(
        <Basic.Div $colorBg="white" $pad={hasActivities ? 0 : 0.5} key={`day-${day}`}>
          {!hasActivities && <Basic.Div $textAlign="right">{day}</Basic.Div>}
          {dateActivities[formattedDate]?.map((activity) => (
            <Tile key={activity.id} activity={activity} isCompact={true} />
          ))}
        </Basic.Div>
      );
    });
    
    return {
      daysWithActivities,
      daysUI: days,
    };
  }, [daysInMonth, firstDayOfMonth, currentMonth, dateActivities, isMobile]);

  const backOneMonth = useCallback(() => navigateMonth(-1), [navigateMonth]);
  const forwardOneMonth = useCallback(() => navigateMonth(1), [navigateMonth]);
  const snapToCurrent = useCallback(() => setCurrentMonth(dayjs()), []);

  return (
    <Basic.Div $maxWidth="100%" $overflowX="auto" $pad={2}>
      <Basic.Div
        $display="flex"
        $flexJustify="center"
        $alignItems="end"
      >
        <Basic.Div $textAlign='center'>
          <Basic.Div $fontSize="h1">
            {currentMonth.format('MMMM YYYY')}
          </Basic.Div>
          <Button $padL={1} $padR={1} onClick={backOneMonth} $fontSize="h4">
            &larr;
          </Button>
          <Button $padL={1} $padR={1} onClick={snapToCurrent} $fontSize="h4">
            Snap to Current
          </Button>
          <Button $padL={1} $padR={1} onClick={forwardOneMonth} $fontSize="h4">
            &rarr;
          </Button>
        </Basic.Div>
      </Basic.Div>

      <Grid
        $marginT={2}
        $templateColumns={`repeat(7, 1fr)`}
        $templateColumnsMdDown={"1fr"}
        $templateRows={`auto repeat(${Math.round((daysUI.length) / 7)}, minmax(222px, 1fr))`}
        $templateRowsMdDown="auto"
        $gap={0.5}
      >
        {!isMobile && ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Basic.Div
            key={day}
            $colorBg="blue0"
            $color="white"
            $pad={0.5}
            $fontSize="h4"
            $position="sticky"
            $top="0"
          >
            {day}
          </Basic.Div>
        ))}
        {daysUI}
      </Grid>
      <Basic.Div $marginT={2}>
        <Basic.Div $fontSize="h4">
          {daysWithActivities} days with activities
        </Basic.Div>
      </Basic.Div>
    </Basic.Div>
  );
};

export default CalendarView;
