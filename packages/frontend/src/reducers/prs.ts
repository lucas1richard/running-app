import { produce } from 'immer';
import { SET_PRS, SET_PRS_BY_DATE } from './prs-actions';
import { createSelector } from 'reselect';

const initialState = {
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

const getPRsState = (state) => state.prs;

export const getPRs = createSelector([
  getPRsState,
], (prs) => prs.prs);

export const getPRsByDate = createSelector([
  getPRsState,
], (prs) => prs.byDate);

export default prsReducer;
