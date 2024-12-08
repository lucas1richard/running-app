import { produce } from 'immer';
import { TOGGLE_COMPARED_ACTIVITY } from './multimap-actions';
import { selectActivity } from './activities';
import { createDeepEqualSelector } from '../utils';
import type { RootState } from '.';

const initialState = {
  comparedActivityIds: [],
};

const multimapReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_COMPARED_ACTIVITY:
      return produce(state, (draft) => {
        draft.comparedActivityIds = draft.comparedActivityIds.includes(action.payload)
          ? draft.comparedActivityIds.filter((id) => id !== action.payload)
          : [...draft.comparedActivityIds, action.payload];
      });

    default:
      return state;
  }
};

export const getMultimapState = (state: RootState) => state.multimap;

export const selectComparedActivityIds = createDeepEqualSelector(
  [getMultimapState],
  (state) => state.comparedActivityIds
);

const getComparedActivities = (state: RootState, ids: number[]) => ids.map((id) => selectActivity(state, id));
export const selectComparedActivities = createDeepEqualSelector(getComparedActivities, (res) => res);

export default multimapReducer;
