import { useDispatch, useSelector } from 'react-redux';
import { selectActivities } from '../reducers/activities';
import MultiMap from './MultiMap';
import classNames from 'classnames';
import { toggleComparedActivityAct } from '../reducers/multimap-actions';
import { selectComparedActivities } from '../reducers/multimap';
import { Basic, Button, Card, Grid } from '../DLS';
import Tile from '../Activities/Tile';

const MultiMapPage = () => {
  const activities = useSelector(selectActivities);
  const compared = useSelector(selectComparedActivities);
  const dispatch = useDispatch();

  const toggleCompare = (activity: Activity) => {
    dispatch(toggleComparedActivityAct(activity.id));
  };
  
  return (
    <Basic.Div pad={2}>
      <MultiMap activityConfigs={compared} showSegments={false} />
      <Grid marginT={1} gap={1} templateColumns="repeat(auto-fill, minmax(500px, 1fr))">
        {activities.map((activity) => {
          const isToggled = compared.some(({ id }) => id === activity.id );

          return (
            <Card
              key={activity.id}
              className={classNames('flex flex-column flex-justify-between',{
                'dls-black-bg': isToggled
              })}
            >
              <Tile activity={activity} isCompact={true} />
              <Button onClick={() => toggleCompare(activity)}>{isToggled ? 'Remove' : 'Compare'}</Button>
            </Card>
          )
        })}
      </Grid>
    </Basic.Div>
  );
}

export default MultiMapPage;
