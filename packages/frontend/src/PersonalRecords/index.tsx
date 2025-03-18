import dayjs from 'dayjs';
import { getPRs, getPRsByDate } from '../reducers/prs';
import DurationDisplay from '../Common/DurationDisplay';
import { Link } from 'react-router-dom';
import PRMedal from '../Common/Icons/PRMedal';
import PRDateCard from './PRDateCard';
import { useAppSelector } from '../hooks/redux';
import { Basic, Card, Flex } from '../DLS';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import useShowAfterMount from '../hooks/useShowAfterMount';
import propSelector from '../utils/propSelector';
import PRChart from './PRChart';

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
          <Card key={pr.distance} $widthXs="100%" $textAlign="center" $flexGrow="1">
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
          </Card>
        ))}
      </Flex>
      <Basic.Div $marginT={1}>
        <h2>PRs By Date</h2>
        <span>Most recent &rarr; least recent</span>
        <Basic.Div $marginT={1}>
          {showChart && Object.keys(prsByDate).length > 0
          ? <PRChart records={prsByDate} title="All" />
          : <ChartLoading />}
          <Basic.Div $marginT={1} $display="flex" $directionSmDown="column" $directionMdUp="row" $gap={1}>
            {names.map((name) => (
              <Basic.Div key={name} $width="100%">
                <Basic.Div
                  $fontSize="h2"
                  $textAlign="center"
                  $position="sticky"
                  $top="0"
                  $colorBg="white"
                  $border="1px solid"
                  $padT={1}
                  $padB={1}
                >
                  {name}
                </Basic.Div>
                <Basic.Table $borderT="none" $colorBg="white" $width="100%" key={name}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Rank</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prsByDate[name].map((pr) => (
                      <Basic.Tr key={pr.start_date_local} $colorBg={propSelector({
                        'gold': pr.pr_rank === 1,
                        'silver': pr.pr_rank === 2,
                        'bronze': pr.pr_rank === 3,
                        'blue3': pr.pr_rank === 4,
                      })}>
                        <td>
                          <Link to={`/${pr.activityId}/detail`}>
                            {dayjs(pr.start_date_local).format('MMM DD, YYYY')}
                          </Link>
                        </td>
                        <Basic.Td>
                          {pr.pr_rank}
                        </Basic.Td>
                        <td>
                          <DurationDisplay numSeconds={pr.elapsed_time} />
                        </td>
                      </Basic.Tr>
                    ))}
                  </tbody>
                </Basic.Table>
              </Basic.Div>
            ))}
          </Basic.Div>
        </Basic.Div>
      </Basic.Div>
    </Basic.Div>
  );
};

export default PRs;
