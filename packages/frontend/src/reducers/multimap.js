import { produce } from 'immer';
import { TOGGLE_COMPARED_ACTIVITY } from './multimap-actions';
import { selectActivity } from './activities';
import { createDeepEqualSelector } from '../utils';

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

export const getMultimapState = (state) => state.multimap;

export const selectComparedActivityIds = createDeepEqualSelector(
  [getMultimapState],
  (state) => state.comparedActivityIds
);

export const selectComparedActivities = createDeepEqualSelector(
  [(state) => state, selectComparedActivityIds],
  (state, ids) => ids.map((id) => selectActivity(state, id)));

export default multimapReducer;
