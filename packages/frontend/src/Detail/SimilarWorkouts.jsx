import React from 'react';
import { useSelector } from 'react-redux';
import { selectSimilarWorkouts } from '../reducers/activities';
import Tile from '../Activities/Tile';
import { idle, useTriggerActionIfStatus } from '../reducers/apiStatus';
import { triggerFetchSimilarWorkouts } from '../reducers/activitydetail-actions';
import { Grid } from '../DLS';

const SimilarWorkouts = ({ activity, zones }) => {
  const id = activity.id;
  const similarDist = useSelector((state) => selectSimilarWorkouts(state, id));
  useTriggerActionIfStatus(triggerFetchSimilarWorkouts(id), idle, { defer: !id });

  return (
    <div>
      {similarDist.length === 0 && <p>None found</p>}
      <Grid gap='1rem'>
        {similarDist.map((activity) => (
          <Tile key={activity.relatedActivity} activity={activity} zones={zones} />
        ))}
      </Grid>
    </div>
  );
}

export default SimilarWorkouts;
