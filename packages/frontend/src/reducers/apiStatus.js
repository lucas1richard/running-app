import { produce } from 'immer';
import { useSelector } from 'react-redux';
import {
  SET_API_ERROR,
  SET_API_LOADING,
  SET_API_SUCCESS,
} from './apiStatus-actions';

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

export const selectApiStatus = (state, key) => state.apiStatus[key]?.status || 'idle';
export const selectLoadingKeys = (state) => Object.keys(state.apiStatus).filter((key) => state.apiStatus[key].status === 'loading');
export const makeStatusSelector = (key) => (state) => selectApiStatus(state, key);
export const useGetApiStatus = (key) => useSelector(makeStatusSelector(key));
export const useGetLoadingKeys = () => useSelector(selectLoadingKeys);

export default apiStatusReducer;
