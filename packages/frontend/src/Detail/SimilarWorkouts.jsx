import React from 'react';
import { useSelector } from 'react-redux';
import { selectSimilarWorkouts } from '../reducers/activities';
import { idle, useTriggerActionIfStatus } from '../reducers/apiStatus';
import { triggerFetchSimilarWorkouts } from '../reducers/activitydetail-actions';
import Tile from '../Activities/Tile';
import { Grid } from '../DLS';

const SimilarWorkouts = ({ activity, zones }) => {
  const id = activity.id;
  const similarDist = useSelector((state) => selectSimilarWorkouts(state, id));
  useTriggerActionIfStatus(triggerFetchSimilarWorkouts(id), idle, { defer: !id });

  return (
    <div>
      {similarDist.length === 0 && <p>None found</p>}
      <Grid
        gap='1rem'
        templateColumns="1fr 1fr 1fr"
        templateColumnsMd="1fr 1fr"
        templateColumnsSmDown="1fr"
      >
        {similarDist.map((activity) => (
          <Tile
            key={activity.relatedActivity}
            isCompact={true}
            activity={activity}
            zones={zones}
          />
        ))}
      </Grid>
    </div>
  );
}

export default SimilarWorkouts;
