import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSimilarWorkouts, selectSimilarWorkoutsMeta } from '../reducers/activities';
import { idle, useTriggerActionIfStatus } from '../reducers/apiStatus';
import { triggerFetchSimilarWorkouts } from '../reducers/activitydetail-actions';
import Tile from '../Activities/Tile';
import { Basic, Button, Grid } from '../DLS';
import { selectComparedActivities } from '../reducers/multimap';
import { toggleComparedActivityAct } from '../reducers/multimap-actions';
import SpeedChart from '../Common/SpeedChart';

const SimilarWorkouts = ({ activity, zones }) => {
  const id = activity.id;
  const similarDist = useSelector((state) => selectSimilarWorkouts(state, id));
  const similarMeta = useSelector((state) => selectSimilarWorkoutsMeta(state, id));
  useTriggerActionIfStatus(triggerFetchSimilarWorkouts(id), idle, { defer: !id });
  const compared = useSelector(selectComparedActivities);
  const dispatch = useDispatch();

  return (
    <div>
      {similarDist.length === 0 && <p>None found</p>}
      <Grid
        $gap={1}
        $templateColumns="1fr 1fr 1fr"
        $templateColumnsMd="1fr 1fr"
        $templateColumnsSmDown="1fr"
      >
        <SpeedChart activities={[...similarDist, activity].filter(Boolean)} />
        {similarDist.filter(Boolean).sort((a, b) => {
          const metaA = similarMeta[a.id];
          const metaB = similarMeta[b.id];
          return metaB.longestCommonSegmentSubsequence - metaA.longestCommonSegmentSubsequence;
        }).map((activity) => {
          const meta = similarMeta[activity.id];
          const toggleCompare = () => {
            dispatch(toggleComparedActivityAct(activity.id));
          };
          const isToggled = compared.some(({ id }) => id === activity.id );
          return (
            <Tile
              key={activity.id}
              isCompact={true}
              activity={activity}
              zones={zones}
            >
              <div className="text-sm">
                Route Score from Base: {meta.routeScoreFromBase}
              </div>
              <div className="text-sm">
                Route score from Related: {meta.routeScoreFromRelated}
              </div>
              <div>
                Summed Route Score: {(meta.routeScoreFromBase + meta.routeScoreFromRelated).toFixed(6)}
              </div>
              <div>
                Longest common subsequence: {meta.longestCommonSegmentSubsequence}
              </div>
              <Button onClick={toggleCompare}>
                {isToggled ? 'Remove Compare' : 'Compare in Multimap'}
              </Button>
            </Tile>
          )
        })}
      </Grid>
    </div>
  );
}

export default SimilarWorkouts;
