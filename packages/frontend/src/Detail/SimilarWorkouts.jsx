import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSimilarWorkouts } from '../reducers/activities';
import Tile from '../Activities/Tile';
import { useGetApiStatus } from '../reducers/apiStatus';

const SimilarWorkouts = ({ activity, zones }) => {
  const id = activity.id;
  const similarDist = useSelector((state) => selectSimilarWorkouts(state, id));
  const apiStatus = useGetApiStatus(`activities/FETCH_SIMILAR_WORKOUTS-${id}`);
  const dispatch = useDispatch();

  useEffect(() => {
    if (apiStatus === 'idle') {
      dispatch({ type: 'activitydetails/FETCH_SIMILAR_WORKOUTS', payload: id });
    }
  }, [dispatch, id, similarDist.length]);

  return (
    <div>
      {similarDist.length === 0 && <p>None found</p>}
      {similarDist.map((activity) => <Tile key={activity.id} activity={activity} zones={zones} />)}
    </div>
  );
}

export default SimilarWorkouts;
