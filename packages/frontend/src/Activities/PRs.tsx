import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { getPRs, getPRsByDate } from '../reducers/prs';
import DurationDisplay from '../Common/DurationDisplay';
import { Link } from 'react-router-dom';
import PRMedal from '../Common/Icons/PRMedal';

const PRs = () => {
  const allTimePrs = useSelector(getPRs);
  const prsByDate = useSelector(getPRsByDate);

  return (
    <div>
      <h2>All Time PRs</h2>
      <div className="flex flex-wrap gap">
        {allTimePrs.map((pr) => (
          <div key={pr.id} className="card text-center flex-item-grow">
            <div className="heading-1">
              <PRMedal type="native" color="gold" />
            </div>
            <div className="heading-4">
              <Link className="heading-4" to={`/${pr.activityId}/detail`}>{pr.name}</Link>
            </div>
            <div>
              {dayjs(pr.start_date_local).format('MMMM DD, YYYY')}
            </div>
            <div className="heading-3">
              <DurationDisplay numSeconds={pr.elapsed_time} />
            </div>
          </div>
        ))}
      </div>
      {/* <h3>PRs By Date</h3>
      <ul>
        {prsByDate.map((pr) => (
          <li key={pr.id}>{pr.name}</li>
        ))}
      </ul> */}
    </div>
  );
};

export default PRs;
