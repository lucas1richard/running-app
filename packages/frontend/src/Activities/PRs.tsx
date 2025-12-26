import { memo } from 'react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { getPRs } from '../reducers/prs';
import DurationDisplay from '../Common/DurationDisplay';
import PRMedal from '../Common/Icons/PRMedal';
import { useAppSelector } from '../hooks/redux';
import { Grid } from '../DLS';
import Surface from '../DLS/Surface';

const PRs = () => {
  const allTimePrs = useAppSelector(getPRs);

  return (
    <div>
      <div className="heading-2 mb-4">All Time PRs</div>
      <Grid
        $templateColumnsLgDown="repeat(auto-fill, minmax(250px, 1fr))"
        $templateColumnsLgUp="repeat(3, 1fr)"
        $gap={1}
      >
        {allTimePrs.map((pr) => (
          <Surface className="card text-center flex-item-grow pad raised-1" key={pr.distance}>
            <div className="heading-1">
              <PRMedal type="native" color="gold" />
            </div>
            <div className="heading-4">
              <Link to={`/${pr.activityId}/detail`}>{pr.name}</Link>
            </div>
            <div>
              {dayjs(pr.start_date_local).format('MMMM DD, YYYY')}
            </div>
            <div className="heading-3">
              <DurationDisplay numSeconds={pr.elapsed_time} />
            </div>
          </Surface>
        ))}
      </Grid>

    </div>
  );
};

export default memo(PRs);
