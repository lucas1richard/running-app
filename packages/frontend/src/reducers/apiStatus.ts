import { produce } from 'immer';
import { shallowEqual, useDispatch } from 'react-redux';
import {
  SET_API_ERROR,
  SET_API_LOADING,
  SET_API_SUCCESS,
} from './apiStatus-actions';
import { createDeepEqualSelector } from '../utils';
import { useEffect } from 'react';
import type { RootState } from '.';
import { useAppSelector } from '../hooks/redux';
import { AsyncAction } from '../types';

export const loading = 'loading';
export const success = 'success';
export const error = 'error';
export const idle = 'idle';

const initialState = {
  // give a custom key to every API request, use uuid if you have to
};

const apiStatusReducer = (state = initialState, action) => {
  if (typeof action.type === 'string') {
    if (action.type.startsWith(SET_API_LOADING)) {
      return produce(state, (draft) => {
        draft[action.key] = {
          status: loading,
        };
      });
    }

    if (action.type.startsWith(SET_API_SUCCESS)) {
      return produce(state, (draft) => {
        draft[action.key] = {
          status: success,
        };
      });
    }

    if (action.type.startsWith(SET_API_ERROR)) {
      return produce(state, (draft) => {
        draft[action.key] = {
          status: error,
        };
      });
    }
  }

  return state;
};

const getApiStatusState = (state: RootState) => state.apiStatus;

const getApiStatus = (state: RootState, key: string) => getApiStatusState(state)[key]?.status || idle;
export const selectApiStatus = createDeepEqualSelector(getApiStatus, (status) => status);

export const selectLoadingKeys = createDeepEqualSelector(
  getApiStatusState,
  (state) => Object.keys(state).filter((key) => state[key].status === loading)
);

export const useGetApiStatus = (key: AsyncAction | string) => useAppSelector(
  (state) => selectApiStatus(state, typeof key === 'string' ? key : key?.key)
);
export const useGetLoadingKeys = () => useAppSelector(selectLoadingKeys, shallowEqual);

export const useTriggerActionIfStatus = (action: AsyncAction, status = idle, { defer = false } = {}) => {
  const dispatch = useDispatch();
  const apiStatus = useGetApiStatus(action);
  useEffect(() => {
    if (apiStatus === status && !defer) dispatch(action);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- don't depend on action
  }, [apiStatus, dispatch, status, defer]);
  return apiStatus;
};

export default apiStatusReducer;
