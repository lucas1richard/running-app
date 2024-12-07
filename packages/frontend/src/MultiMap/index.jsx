import { useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { selectActivities } from '../reducers/activities';
import MultiMap from './MultiMap';
import GoogleMapImage from '../Common/GoogleMapImage';
import { getSummaryPolyline } from '../utils';
import classNames from 'classnames';

const MultiMapPage = () => {
  const activities = useSelector(selectActivities);
  const [compare, setCompare] = useState([]);

  const toggleCompare = (activity) => {
    if (compare.some(({ id }) => id === activity.id)) {
      setCompare((pre) => pre.filter(({ id }) => id !== activity.id));
    } else {
      setCompare((pre) => [...pre, activity]);
    }
  };
  
  return (
    <div>
      <MultiMap activityConfigs={compare} showSegments={false} />
      <div className="flex flex-wrap gap">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={classNames('card flex-item-grow flex-item-shrink',{
              'dls-highlighted-bg': compare.some(({ id }) => id === activity.id )
            })}
          >
            <GoogleMapImage
              activityId={activity.id}
              polyline={getSummaryPolyline(activity)}
              alt="summary route"
              imgWidth={600}
              imgHeight={300}
              width="400"
              height="200"
            />
            <h2>{activity.name}</h2>
            <p>{dayjs(activity.start_date).format('YYYY-MM-DD')}</p>
            <button onClick={() => toggleCompare(activity)}>Compare</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MultiMapPage;
