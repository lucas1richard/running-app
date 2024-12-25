import Tile from './Tile';
import Spinner from '../Loading/Spinner';
import { useDispatch } from 'react-redux';
import { TRIGGER_UPDATE_ACTIVITY, triggerUpdateActivity } from '../reducers/activitydetail-actions';
import { useGetApiStatus } from '../reducers/apiStatus';
import { useCallback } from 'react';

type ActivityTileProps = {
  className: string;
  activity: Activity;
  backgroundIndicator: string;
  showHideFunction: boolean;
};

const ActivityTile: React.FC<ActivityTileProps> = ({
  className,
  activity,
  backgroundIndicator,
  showHideFunction,
}) => {
  const dispatch = useDispatch();
  const isLoading = useGetApiStatus(`${TRIGGER_UPDATE_ACTIVITY}-${activity.id}`) === 'loading';
  const hideActivity = useCallback(() => {
    dispatch(triggerUpdateActivity({ id: activity.id, hidden: !activity.hidden }));
  }, [activity.hidden, activity.id, dispatch]);

  return (
    <div key={activity.id} className={className}>
      <Tile
        activity={activity}
        backgroundIndicator={backgroundIndicator}
      />

      {showHideFunction && (
        <div className="text-right">
          {isLoading
            ? <Spinner />
            : (
            <label htmlFor={`${activity.id}-hider`}>
              Hide Activity&nbsp;
              <input
                id={`${activity.id}-hider`}
                type="checkbox"
                checked={activity.hidden}
                onChange={hideActivity}
              />
            </label>
            )}
        </div>
      )}
    </div>
  );
};

export default ActivityTile;
