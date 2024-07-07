import React from 'react';
import { useSelector } from 'react-redux';
import { selectSimilarWorkouts } from '../reducers/activities';
import Tile from '../Activities/Tile';
import { idle, useTriggerActionIfStatus } from '../reducers/apiStatus';
import { triggerFetchSimilarWorkouts } from '../reducers/activitydetail-actions';

const SimilarWorkouts = ({ activity, zones }) => {
  const id = activity.id;
  const similarDist = useSelector((state) => selectSimilarWorkouts(state, id));
  useTriggerActionIfStatus(triggerFetchSimilarWorkouts(id), idle, { defer: !id });

  return (
    <div>
      {similarDist.length === 0 && <p>None found</p>}
      {similarDist.map((activity) => (
        <Tile key={activity.relatedActivity} activity={activity} zones={zones} />
      ))}
    </div>
  );
}

export default SimilarWorkouts;
