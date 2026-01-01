import { memo } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { getPRs } from '../reducers/prs';
import DurationDisplay from '../Common/DurationDisplay';
import { useAppSelector } from '../hooks/redux';
import { Grid } from '../DLS';
import Surface from '../DLS/Surface';
import useViewSize from '../hooks/useViewSize';

const PRs = () => {
  const allTimePrs = useAppSelector(getPRs);
  const navigate = useNavigate();
  const viewSize = useViewSize();

  const isMdUp = viewSize.lte('md');

  return (
    <div>
      <div className="heading-2 mb-4">All Time PRs</div>
      <Grid
        $templateColumnsLgDown="repeat(auto-fill, minmax(250px, 1fr))"
        $templateColumnsLgUp="repeat(4, 1fr)"
        $gap={1}
      >
        {allTimePrs.map((pr) => (
          <Surface
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/${pr.activityId}/detail`)}
            className="shine-button card text-center flex-item-grow bg-gold-200 hover:bg-gold-300 text-gold-900 pad raised-3 flex items-center justify-between p-4"
            key={pr.distance}
          >
            <div className="heading-1">
              <div className="heading-4">
                {pr.name}
              </div>
            </div>
            <div className="text-right">
              <div>
                {dayjs(pr.start_date_local).format('MMMM DD, YYYY')}
              </div>
              <div className="heading-5">
                <DurationDisplay numSeconds={pr.elapsed_time} units={isMdUp ? undefined : ['', ':', ':']} />
              </div>
            </div>
          </Surface>
        ))}
      </Grid>

    </div>
  );
};

export default memo(PRs);
