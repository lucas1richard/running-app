import { useDispatch, useSelector } from 'react-redux';
import { selectActivities } from '../reducers/activities';
import MultiMap from './MultiMap';
import { toggleComparedActivityAct } from '../reducers/multimap-actions';
import { selectComparedActivities } from '../reducers/multimap';
import { Basic, Button, Grid } from '../DLS';
import Tile from '../Activities/Tile';
import MultiMapMapLibre from './MultiMapMapLibre';

const MultiMapPage = () => {
  const activities = useSelector(selectActivities);
  const compared = useSelector(selectComparedActivities);
  const dispatch = useDispatch();

  const toggleCompare = (activity: Activity) => {
    dispatch(toggleComparedActivityAct(activity.id));
  };

  return (
    <div className="pad">
      <Basic.Div $height="900px" $width="100%">
        <MultiMapMapLibre activityConfigs={compared} />
      </Basic.Div>
      <Grid className="mt-4 gap" $templateColumns="repeat(auto-fill, minmax(500px, 1fr))">
        {activities.map((activity) => {
          const isToggled = compared.some(({ id }) => id === activity.id);

          return (
            <Tile className="card" key={activity.id} activity={activity} isCompact={true}>
              <Button className={`full-width ${isToggled ? 'gold-bg' : ''}`} onClick={() => toggleCompare(activity)}>
                {isToggled ? 'Remove' : 'Compare'}
              </Button>
            </Tile>
          )
        })}
      </Grid>
    </div>
  );
}

export default MultiMapPage;
