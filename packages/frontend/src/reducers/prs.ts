import { produce } from 'immer';
import { createSelector } from 'reselect';
import { SET_PRS, SET_PRS_BY_DATE } from './prs-actions';

import { type RootState } from '.';
type PRInitialState = {
  prs: BestEffort[];
  byDate: Record<string, BestEffort[]>;
};

const initialState: PRInitialState = {
  prs: [],
  byDate: {},
};

export const prsReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case SET_PRS:
        draft.prs = action.payload;
        break;
      case SET_PRS_BY_DATE:
        draft.byDate = action.payload;
        break;
    }
  });

const getPRsState = (state: RootState) => state.prs;

export const getPRs = createSelector(getPRsState, (prs) => prs.prs);

export const selectPRsByDate = createSelector(getPRsState, (prs) => prs.byDate);

export default prsReducer;
