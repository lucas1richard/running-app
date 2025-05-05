import dayjs from 'dayjs';
import { getPRs } from '../reducers/prs';
import DurationDisplay from '../Common/DurationDisplay';
import { Link } from 'react-router-dom';
import PRMedal from '../Common/Icons/PRMedal';
import { useAppSelector } from '../hooks/redux';
import { Basic, Card, Flex, Grid } from '../DLS';
import { memo } from 'react';
import Surface from '../DLS/Surface';

const PRs = () => {
  const allTimePrs = useAppSelector(getPRs);

  return (
    <div>
      <Basic.Div $fontSize="h2" $marginB={1}>All Time PRs</Basic.Div>

      <Grid
        $templateColumnsLgDown="repeat(auto-fill, minmax(250px, 1fr))"
        $templateColumnsLgUp="repeat(3, 1fr)"
        $gap={1}
      >
        {allTimePrs.map((pr) => (
          <Surface className="card text-center flex-item-grow pad" key={pr.distance}>
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
          </Surface>
        ))}
      </Grid>

    </div>
  );
};

export default memo(PRs);
