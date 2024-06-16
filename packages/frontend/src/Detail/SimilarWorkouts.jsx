import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSimilarWorkouts } from '../reducers/activities';
import Tile from '../Activities/Tile';
import { useGetApiStatus } from '../reducers/apiStatus';
import {
  FETCH_SIMILAR_WORKOUTS,
  triggerFetchSimilarWorkouts,
} from '../reducers/activitydetail-actions';

const SimilarWorkouts = ({ activity, zones }) => {
  const id = activity.id;
  const similarDist = useSelector((state) => selectSimilarWorkouts(state, id));
  const apiStatus = useGetApiStatus(`${FETCH_SIMILAR_WORKOUTS}-${id}`);
  const dispatch = useDispatch();

  useEffect(() => {
    if (id && apiStatus === 'idle') {
      dispatch(triggerFetchSimilarWorkouts(id))
    }
  }, [apiStatus, dispatch, id, similarDist.length]);

  return (
    <div>
      {similarDist.length === 0 && <p>None found</p>}
      {similarDist.map((activity) => <Tile key={activity.relatedActivity} activity={activity} zones={zones} />)}
    </div>
  );
}

export default SimilarWorkouts;
