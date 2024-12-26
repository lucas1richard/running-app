import { useDispatch, useSelector } from 'react-redux';
import { selectActivities } from '../reducers/activities';
import MultiMap from './MultiMap';
import classNames from 'classnames';
import { toggleComparedActivityAct } from '../reducers/multimap-actions';
import { selectComparedActivities } from '../reducers/multimap';
import { Button, Grid } from '../DLS';
import Tile from '../Activities/Tile';

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
      <Grid className="margin-t" gap="1rem" templateColumns="repeat(auto-fill, minmax(500px, 1fr))">
        {activities.map((activity, index) => {
          const isToggled = compared.some(({ id }) => id === activity.id );

          return (
            <div
              key={activity.id}
              className={classNames('card flex flex-column flex-justify-between',{
                'dls-black-bg': isToggled
              })}
            >
              <Tile activity={activity} isCompact={true} />
              <Button onClick={() => toggleCompare(activity)}>{isToggled ? 'Remove' : 'Compare'}</Button>
            </div>
          )
        })}
      </Grid>
    </div>
  );
}

export default MultiMapPage;
