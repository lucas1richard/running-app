import React from 'react';
import { useSelector } from 'react-redux';
import { selectSimilarWorkouts, selectSimilarWorkoutsMeta } from '../reducers/activities';
import { idle, useTriggerActionIfStatus } from '../reducers/apiStatus';
import { triggerFetchSimilarWorkouts } from '../reducers/activitydetail-actions';
import Tile from '../Activities/Tile';
import { Basic, Grid } from '../DLS';

const SimilarWorkouts = ({ activity, zones }) => {
  const id = activity.id;
  const similarDist = useSelector((state) => selectSimilarWorkouts(state, id));
  const similarMeta = useSelector((state) => selectSimilarWorkoutsMeta(state, id));
  useTriggerActionIfStatus(triggerFetchSimilarWorkouts(id), idle, { defer: !id });

  return (
    <div>
      {similarDist.length === 0 && <p>None found</p>}
      <Grid
        gap={1}
        templateColumns="1fr 1fr 1fr"
        templateColumnsMd="1fr 1fr"
        templateColumnsSmDown="1fr"
      >
        {similarDist.filter(Boolean).sort((a, b) => {
          const metaA = similarMeta[a.id];
          const metaB = similarMeta[b.id];
          return metaB.longestCommonSegmentSubsequence - metaA.longestCommonSegmentSubsequence;
        }).map((activity) => {
          const meta = similarMeta[activity.id];
          return (
            <Tile
              key={activity.relatedActivity}
              isCompact={true}
              activity={activity}
              zones={zones}
            >
              <Basic.Div fontSize="sm">
                Route Score from Base: {meta.routeScoreFromBase}
              </Basic.Div>
              <Basic.Div fontSize="sm">
                Route score from Related: {meta.routeScoreFromRelated}
              </Basic.Div>
              <div>
                Summed Route Score: {(meta.routeScoreFromBase + meta.routeScoreFromRelated).toFixed(6)}
              </div>
              <div>
                Longest common subsequence: {meta.longestCommonSegmentSubsequence}
              </div>
            </Tile>
          )
        })}
      </Grid>
    </div>
  );
}

export default SimilarWorkouts;
