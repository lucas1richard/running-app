import dayjs from 'dayjs';
import { getPRs, getPRsByDate } from '../reducers/prs';
import DurationDisplay from '../Common/DurationDisplay';
import { Link } from 'react-router-dom';
import PRMedal from '../Common/Icons/PRMedal';
import PRDateCard from './PRDateCard';
import PRChart from './PRChart';
import { useAppSelector } from '../hooks/redux';
import { Basic, Card, Flex } from '../DLS';

const PRs = () => {
  const allTimePrs = useAppSelector(getPRs);
  const prsByDate = useAppSelector(getPRsByDate);
  const names = Object.keys(prsByDate);

  return (
    <Basic.Div marginMdUp={2} marginSm={1}>
      <h2>All Time PRs</h2>
      <Flex wrap="wrap" gap={1}>
        {allTimePrs.map((pr) => (
          <Card key={pr.distance} widthXs="100%" textAlign="center" flexGrow="1">
            <Basic.Div fontSize="h1">
              <PRMedal type="native" color="gold" />
            </Basic.Div>
            <Basic.Div fontSize="h4">
              <Link className="heading-4" to={`/${pr.activityId}/detail`}>{pr.name}</Link>
            </Basic.Div>
            <div>
              {dayjs(pr.start_date_local).format('MMMM DD, YYYY')}
            </div>
            <Basic.Div fontSize="h3">
              <DurationDisplay numSeconds={pr.elapsed_time} />
            </Basic.Div>
          </Card>
        ))}
      </Flex>
      <Basic.Div marginT={1}>
        <h2>PRs By Date</h2>
        <span>Most recent &rarr; least recent</span>
        <Basic.Div marginT={1}>
          {names.map((name) => (
            <Basic.Div key={name} flexShrink="0" marginT={3}>
              <Flex overflowX="scroll" gap={1}>
                <Flex fontSize="h1" alignItems="center" flexShrink="1">{name}</Flex>
                <Flex fontSize="h1" alignItems="center" flexShrink="1">
                  &rarr;
                </Flex>
                {prsByDate[name].map((pr) => (
                  <PRDateCard pr={pr} key={pr.start_date_local} />
                ))}
              </Flex>
              <PRChart records={prsByDate[name]} title={name} />
            </Basic.Div>
          ))
          }
        </Basic.Div>
      </Basic.Div>
    </Basic.Div>
  );
};

export default PRs;
