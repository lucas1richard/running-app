import dayjs from 'dayjs';
import { getPRs } from '../reducers/prs';
import DurationDisplay from '../Common/DurationDisplay';
import { Link } from 'react-router-dom';
import PRMedal from '../Common/Icons/PRMedal';
import { useAppSelector } from '../hooks/redux';
import { Basic, Card, Flex, Grid } from '../DLS';

const PRs = () => {
  const allTimePrs = useAppSelector(getPRs);

  return (
    <div>
      <h2>All Time PRs</h2>

      <Grid
        $templateColumnsLgDown="repeat(auto-fill, minmax(250px, 1fr))"
        $templateColumnsLgUp="repeat(3, 1fr)"
        $gap={1}
      >
        {allTimePrs.map((pr) => (
          <Card key={pr.distance} $textAlign="center" $flexGrow="1">
            <Basic.Div $fontSize="h1">
              <PRMedal type="native" color="gold" />
            </Basic.Div>

            <Basic.Div $fontSize="h4">
              <Link to={`/${pr.activityId}/detail`}>{pr.name}</Link>
            </Basic.Div>

            <div>
              {dayjs(pr.start_date_local).format('MMMM DD, YYYY')}
            </div>

            <Basic.Div $fontSize="h3">
              <DurationDisplay numSeconds={pr.elapsed_time} />
            </Basic.Div>
          </Card>
        ))}
      </Grid>

    </div>
  );
};

export default PRs;
