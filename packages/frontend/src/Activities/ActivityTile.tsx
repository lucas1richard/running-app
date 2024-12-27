import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useGetApiStatus } from '../reducers/apiStatus';
import { TRIGGER_UPDATE_ACTIVITY, triggerUpdateActivity } from '../reducers/activitydetail-actions';
import Spinner from '../Loading/Spinner';
import { Basic } from '../DLS';
import Tile from './Tile';

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
        <Basic.Div textAlign="right">
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
        </Basic.Div>
      )}
    </div>
  );
};

export default ActivityTile;
