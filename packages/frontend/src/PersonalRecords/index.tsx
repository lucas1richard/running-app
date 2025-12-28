import dayjs from 'dayjs';
import { getPRs, getPRsByDate } from '../reducers/prs';
import DurationDisplay from '../Common/DurationDisplay';
import { Link } from 'react-router-dom';
import PRMedal from '../Common/Icons/PRMedal';
import { useAppSelector } from '../hooks/redux';
import { Basic, Flex } from '../DLS';
import { useMemo } from 'react';
import useShowAfterMount from '../hooks/useShowAfterMount';
// import PRChart from './PRChart';
import { getDurationString } from '../utils';
import Surface from '../DLS/Surface';
import PRCalendarChart from './PRCalendarChart';
import './personalrecords.module.scss';

// const ChartLoading = () => (
//   <Basic.Div $height="2200px" />
// );

const PRs = () => {
  const showChart = useShowAfterMount();
  const allTimePrs = useAppSelector(getPRs);
  const prsByDate = useAppSelector(getPRsByDate);
  const names = useMemo(() => Object.keys(prsByDate), [prsByDate]);

  return (
    <Basic.Div $marginMdUp={2} $marginSm={1}>
      <div className="mt-4">
        <h2>PRs By Date</h2>
        <span>Most recent &rarr; least recent</span>
        <div className="mt-2">
          <PRCalendarChart records={prsByDate} />
        </div>
        <div className="mt-2">
          {/* {showChart && Object.keys(prsByDate).length > 0
          ? <PRChart records={prsByDate} title="All" />
          : <ChartLoading />} */}

          <Basic.Div $marginT={1} $display="flex" $directionMdDown="column" $directionLgUp="row" $gap={1}>
            {names.map((name) => name.startsWith('100') ? null : (
              <div key={name} className="full-width">
                <Basic.Div
                  $fontSize="h2"
                  $textAlign="center"
                  $position="sticky"
                  $top="0"
                >
                  <Surface>
                    {name}
                  </Surface>
                </Basic.Div>
                <table className="bg-foreground w-full elevation-1" key={name}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Rank</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prsByDate[name].map((pr, ix) => {
                      let colorBg: 'white' | 'gold' | 'silver' | 'bronze' = 'white';
                      if (pr.pr_rank === 1) colorBg = 'gold';
                      if (pr.pr_rank === 2) colorBg = 'silver';
                      if (pr.pr_rank === 3) colorBg = 'bronze';
                      return (
                      <tr key={pr.start_date_local} className={ix % 2 === 0 ? 'sunken-1' : ''}>
                        <td>
                          <Link to={`/${pr.activityId}/detail`}>
                            {dayjs(pr.start_date_local).format('DD MMM YYYY')}
                          </Link>
                        </td>
                        <td>
                          {pr.pr_rank}
                        </td>
                        <td>
                          {getDurationString(pr.elapsed_time, ['s', 'm ', 'h '])}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            ))}
          </Basic.Div>
        </div>
      </div>
    </Basic.Div>
  );
};

export default PRs;
