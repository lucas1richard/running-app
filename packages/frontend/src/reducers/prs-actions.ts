import type { AsyncAction } from '../types';

// SAGA TRIGGERS
export const FETCH_PRS = 'prs/FETCH_PRS';
export const triggerFetchPrs = (forceFetch = false): AsyncAction => ({
  type: FETCH_PRS,
  forceFetch,
  key: FETCH_PRS,
});

export const FETCH_PRS_BY_DATE = 'prs/FETCH_PRS_BY_DATE';
export const triggerFetchPrsByDate = (): AsyncAction => ({
  type: FETCH_PRS_BY_DATE,
  key: FETCH_PRS_BY_DATE,
});

// REDUCER ACTIONS
export const SET_PRS = 'prsReducer/SET_PRS';
export const setPrsAct = (prs: PR[]) => ({ type: SET_PRS, payload: prs });

export const SET_PRS_BY_DATE = 'prsReducer/SET_PRS_BY_DATE';
export const setPrsByDateAct = (prs: PR[]) => ({ type: SET_PRS_BY_DATE, payload: prs });

