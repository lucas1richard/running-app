import React from 'react';
import Tile from './Tile';
import Spinner from '../Loading/Spinner';
import { useDispatch } from 'react-redux';
import { TRIGGER_UPDATE_ACTIVITY, triggerUpdateActivity } from '../reducers/activitydetail-actions';
import { useGetApiStatus } from '../reducers/apiStatus';

const ActivityTile = ({ activity, backgroundIndicator, showHideFunction }) => {
  const dispatch = useDispatch();
  const isLoading = useGetApiStatus(`${TRIGGER_UPDATE_ACTIVITY}-${activity.id}`) === 'loading';

  return (
    <div key={activity.id}>
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
              Hide Activity
              <input
                id={`${activity.id}-hider`}
                type="checkbox"
                checked={activity.hidden}
                onChange={() => dispatch(triggerUpdateActivity({ id: activity.id, hidden: !activity.hidden }))}
              />
            </label>
            )}
        </div>
      )}
    </div>
  );
};

export default ActivityTile;
