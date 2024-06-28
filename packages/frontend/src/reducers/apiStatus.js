import { produce } from 'immer';
import { shallowEqual, useSelector } from 'react-redux';
import {
  SET_API_ERROR,
  SET_API_LOADING,
  SET_API_SUCCESS,
} from './apiStatus-actions';
import { createDeepEqualSelector } from '../utils';

const initialState = {
  // give a custom key to every API request, use uuid if you have to
};

const apiStatusReducer = (state = initialState, action) => {
  if (typeof action.type === 'string') {
    if (action.type.startsWith(SET_API_LOADING)) {
      return produce(state, (draft) => {
        draft[action.key] = {
          status: 'loading',
        };
      });
    }
  
    if (action.type.startsWith(SET_API_SUCCESS)) {
      return produce(state, (draft) => {
        draft[action.key] = {
          status: 'success',
        };
      });
    }
  
    if (action.type.startsWith(SET_API_ERROR)) {
      return produce(state, (draft) => {
        draft[action.key] = {
          status: 'error',
        };
      });
    }
  }

  return state;
};

const getApiStatusState = (state) => state.apiStatus;

export const selectApiStatus = createDeepEqualSelector(
  getApiStatusState,
  (state, key) => key,
  (state, key) => state[key]?.status || 'idle'
);

export const selectLoadingKeys = createDeepEqualSelector(
  getApiStatusState,
  (state) => Object.keys(state).filter((key) => state[key].status === 'loading')
);

export const makeStatusSelector = (key) => (state) => selectApiStatus(state, key);
export const useGetApiStatus = (key) => useSelector(makeStatusSelector(key));
export const useGetLoadingKeys = () => useSelector(selectLoadingKeys, shallowEqual);

export default apiStatusReducer;
