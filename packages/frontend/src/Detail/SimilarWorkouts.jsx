import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSimilarWorkouts } from '../reducers/activities';
import Tile from '../Activities/Tile';

const SimilarWorkouts = ({ activity, zones }) => {
  const id = activity.id;
  const similarDist = useSelector((state) => selectSimilarWorkouts(state, id));
  const dispatch = useDispatch();

  useEffect(() => {
    if (similarDist.length === 0) {
      dispatch({ type: 'activitydetails/FETCH_SIMILAR_WORKOUTS', payload: id });
    }
  }, [dispatch, id, similarDist.length]);

  return (
    <div>
      <h2>Similar Runs</h2>
      {similarDist.length === 0 && <p>None found</p>}
      {similarDist.map((activity) => <Tile key={activity.id} activity={activity} zones={zones} />)}
    </div>
  );
}

export default SimilarWorkouts;
