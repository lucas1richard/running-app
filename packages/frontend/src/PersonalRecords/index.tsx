import dayjs from 'dayjs';
import { getPRs, getPRsByDate } from '../reducers/prs';
import DurationDisplay from '../Common/DurationDisplay';
import { Link } from 'react-router-dom';
import PRMedal from '../Common/Icons/PRMedal';
import { useAppSelector } from '../hooks/redux';
import { Basic, Card, Flex } from '../DLS';
import { useMemo } from 'react';
import useShowAfterMount from '../hooks/useShowAfterMount';
import PRChart from './PRChart';
import { getDurationString } from '../utils';
import Surface from '../DLS/Surface';

const ChartLoading = () => (
  <Basic.Div $height="2200px" />
);

const PRs = () => {
  const showChart = useShowAfterMount();
  const allTimePrs = useAppSelector(getPRs);
  const prsByDate = useAppSelector(getPRsByDate);
  const names = useMemo(() => Object.keys(prsByDate), [prsByDate]);

  return (
    <Basic.Div $marginMdUp={2} $marginSm={1}>
      <h2>All Time PRs</h2>
      <Flex $wrap="wrap" $gap={1}>
        {allTimePrs.map((pr) => (
          <Surface key={pr.distance} className="card text-center flex-item-grow pad">
            <Basic.Div $fontSize="h1">
              <PRMedal type="native" color="gold" />
            </Basic.Div>
            <Basic.Div $fontSize="h4">
              <Link className="heading-4" to={`/${pr.activityId}/detail`}>{pr.name}</Link>
            </Basic.Div>
            <div>
              {dayjs(pr.start_date_local).format('MMMM DD, YYYY')}
            </div>
            <Basic.Div $fontSize="h3">
              <DurationDisplay numSeconds={pr.elapsed_time} />
            </Basic.Div>
          </Surface>
        ))}
      </Flex>
      <Basic.Div $marginT={1}>
        <h2>PRs By Date</h2>
        <span>Most recent &rarr; least recent</span>
        <Basic.Div $marginT={1}>
          {showChart && Object.keys(prsByDate).length > 0
          ? <PRChart records={prsByDate} title="All" />
          : <ChartLoading />}

          <Basic.Div $marginT={1} $display="flex" $directionMdDown="column" $directionLgUp="row" $gap={1}>
            {names.map((name) => name.startsWith('100') ? null : (
              <div key={name} className="full-width">
                <Basic.Div
                  $fontSize="h2"
                  $textAlign="center"
                  $position="sticky"
                  $top="0"
                  $border="1px solid"
                >
                  <Surface className="pad-tb">
                    {name}
                  </Surface>
                </Basic.Div>
                <Basic.Table className="bg-foreground" $borderT="none" $width="100%" key={name}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Rank</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prsByDate[name].map((pr) => {
                      let colorBg: 'white' | 'gold' | 'silver' | 'bronze' = 'white';
                      if (pr.pr_rank === 1) colorBg = 'gold';
                      if (pr.pr_rank === 2) colorBg = 'silver';
                      if (pr.pr_rank === 3) colorBg = 'bronze';
                      return (
                      <tr key={pr.start_date_local}>
                        <td>
                          <Link to={`/${pr.activityId}/detail`}>
                            {dayjs(pr.start_date_local).format('MMM DD, YYYY')}
                          </Link>
                        </td>
                        <td>
                          {pr.pr_rank}
                        </td>
                        <td>
                          {getDurationString(pr.elapsed_time)}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </Basic.Table>
              </div>
            ))}
          </Basic.Div>
        </Basic.Div>
      </Basic.Div>
    </Basic.Div>
  );
};

export default PRs;
