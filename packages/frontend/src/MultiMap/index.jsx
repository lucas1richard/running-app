import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { selectActivities } from '../reducers/activities';
import MultiMap from './MultiMap';
import GoogleMapImage from '../Common/GoogleMapImage';
import { getSummaryPolyline } from '../utils';
import classNames from 'classnames';
import { toggleComparedActivityAct } from '../reducers/multimap-actions';
import { selectComparedActivities } from '../reducers/multimap';

const MultiMapPage = () => {
  const activities = useSelector(selectActivities);
  const compared = useSelector(selectComparedActivities);
  const dispatch = useDispatch();

  const toggleCompare = (activity) => {
    dispatch(toggleComparedActivityAct(activity.id));
  };
  
  return (
    <div>
      <MultiMap activityConfigs={compared} showSegments={false} />
      <div className="flex flex-wrap gap">
        {activities.map((activity, index) => {
          const isToggled = compared.some(({ id }) => id === activity.id );

          return (
            <div
              key={activity.id}
              className={classNames('card flex-item-grow flex-item-shrink',{
                'dls-highlighted-bg': isToggled
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
              <button onClick={() => toggleCompare(activity)}>{isToggled ? 'Remove' : 'Compare'}</button>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default MultiMapPage;
