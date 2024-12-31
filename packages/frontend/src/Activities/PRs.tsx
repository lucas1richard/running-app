import dayjs from 'dayjs';
import { getPRs } from '../reducers/prs';
import DurationDisplay from '../Common/DurationDisplay';
import { Link } from 'react-router-dom';
import PRMedal from '../Common/Icons/PRMedal';
import { useAppSelector } from '../hooks/redux';
import { Basic, Card, Flex } from '../DLS';

const PRs = () => {
  const allTimePrs = useAppSelector(getPRs);

  return (
    <div>
      <h2>All Time PRs</h2>

      <Flex wrap="wrap" gap={1}>
        {allTimePrs.map((pr) => (
          <Card key={pr.effort_id} textAlign="center" flexGrow="1">
            <Basic.Div fontSize="h1">
              <PRMedal type="native" color="gold" />
            </Basic.Div>

            <Basic.Div fontSize="h4">
              <Link to={`/${pr.activityId}/detail`}>{pr.name}</Link>
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

    </div>
  );
};

export default PRs;
