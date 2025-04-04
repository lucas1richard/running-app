import { useEffect } from 'react';
import { produce } from 'immer';
import { shallowEqual, useDispatch } from 'react-redux';
import { hash } from 'ohash';
import { useAppSelector } from '../hooks/redux';
import { createDeepEqualSelector } from '../utils';
import type { ApiStatusAction, AsyncAction } from '../types';
import {
  loadingSymbol,
  successSymbol,
  errorSymbol,
} from './apiStatus-actions';
import type { RootState } from '.';

type APIStatusType = 'loading' | 'success' | 'error' | 'idle';

export const loading: APIStatusType = 'loading';
export const success: APIStatusType = 'success';
export const error: APIStatusType = 'error';
export const idle: APIStatusType = 'idle';

type ApiStatusInitialState = {
};

const initialState: ApiStatusInitialState = {
  // give a custom key to every API request, use uuid if you have to
};

const apiStatusReducer = (state = initialState, action: ApiStatusAction) => {
  switch (action.symbol) {
    case loadingSymbol: {
      return produce(state, (draft) => {
        draft[action.key] = {
          status: loading,
        };
      });
    }

    case successSymbol: {
      return produce(state, (draft) => {
        draft[action.key] = {
          status: success,
        };
      });
    }

    case errorSymbol: {
      return produce(state, (draft) => {
        draft[action.key] = {
          status: error,
        };
      });
    }

    default: {
      return state;
    }
  }
};

export const getDataNotReady = (apiStatus: APIStatusType) => apiStatus === idle || apiStatus === loading;

const getApiStatusState = (state: RootState) => state.apiStatus;

const getApiStatus = (state: RootState, key: string) => getApiStatusState(state)[key]?.status || idle;
export const selectApiStatus = createDeepEqualSelector(getApiStatus, (status) => status);

export const selectLoadingKeys = createDeepEqualSelector(
  getApiStatusState,
  (state) => Object.keys(state).filter((key) => state[key].status === loading)
);

export const useGetApiStatus = (action: AsyncAction | string) => useAppSelector(
  (state) => selectApiStatus(state, typeof action === 'string' ? action : (action?.key ? action.key : hash(action)))
);
export const useGetLoadingKeys = () => useAppSelector(selectLoadingKeys, shallowEqual);

export const useTriggerActionIfStatus = (action: AsyncAction, status: APIStatusType = idle, { defer = false } = {}) => {
  const dispatch = useDispatch();
  const apiStatus = useGetApiStatus(action);
  useEffect(() => {
    if (apiStatus === status && !defer) dispatch(action);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- don't depend on action
  }, [apiStatus, dispatch, status, defer]);
  return apiStatus;
};

export default apiStatusReducer;
