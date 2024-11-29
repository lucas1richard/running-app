import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { getPRs, getPRsByDate } from '../reducers/prs';
import DurationDisplay from '../Common/DurationDisplay';
import { Link } from 'react-router-dom';
import PRMedal from '../Common/Icons/PRMedal';
import PRDateCard from './PRDateCard';
import PRChart from './PRChart';

const PRs = () => {
  const allTimePrs = useSelector(getPRs);
  const prsByDate = useSelector(getPRsByDate);
  const names = Object.keys(prsByDate);

  return (
    <div className="margin-t">
      <h2>All Time PRs</h2>
      <div className="flex flex-wrap gap">
        {allTimePrs.map((pr) => (
          <div key={pr.effort_id} className="card text-center flex-item-grow">
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
      <div className="margin-t">
        <h2>PRs By Date</h2>
        <span>Most recent &rarr; least recent</span>
        <div className="margin-t">
          {names.map((name) => (
            <div key={name}>
              <div className="flex gap overflow-x-scroll">
                <h1 className="valign-middle flex-align-center">{name}</h1>
                <div className="heading-1 valign-middle">
                  &rarr;
                </div>
                {prsByDate[name].map((pr) => (
                  <PRDateCard pr={pr} key={pr.effort_id} />
                ))}
              </div>
              <PRChart records={prsByDate[name]} title={name} />
            </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default PRs;
