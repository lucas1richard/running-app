import classNames from 'classnames';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import DurationDisplay from '../Common/DurationDisplay';
import { useSelector } from 'react-redux';
import { selectActivity } from '../reducers/activities';

const PRDateCard = ({ pr }) => {
  const activity = useSelector(state => selectActivity(state, pr.activityId));
  return (
    <div key={pr.id} className={classNames('card text-center', {
      'gold-bg': pr.pr_rank === 1,
      'silver-bg': pr.pr_rank === 2,
      'bronze-bg': pr.pr_rank === 3,
    })}>
      <div className="heading-3">
        <DurationDisplay numSeconds={pr.elapsed_time} />
      </div>
      <div className="heading-5">
          {dayjs(pr.start_date_local).format('MMMM DD, YYYY')}
      </div>
      <div className="heading-5 margin-t">
        {activity?.name}
      </div>
      <div>
        <Link className="heading-5 btn" to={`/${pr.activityId}/detail`}>
          View Activity
        </Link>
      </div>
    </div>
  );
};

export default PRDateCard;
